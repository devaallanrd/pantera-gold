import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID, randomBytes, createHash, createHmac } from 'node:crypto';
import { seedProducts, type Product } from './catalog';
import { checkoutSchema, productSchema, StoreError } from './schemas';
import type { z } from 'zod';
import type { Order } from './order-types';
let database: DatabaseSync | undefined;
function dir() {
  return resolve(/* turbopackIgnore: true */ process.env.DATA_DIR ?? '.data');
}
export function db() {
  if (process.env.STORE_MODE && process.env.STORE_MODE !== 'demo')
    throw new StoreError(
      'Producción bloqueada: conecta y valida el adaptador Supabase antes de habilitar ventas.',
      503,
    );
  if (database) return database;
  mkdirSync(dir(), { recursive: true, mode: 0o700 });
  const d = new DatabaseSync(resolve(dir(), 'demo.sqlite'));
  d.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS products(id TEXT PRIMARY KEY,slug TEXT UNIQUE NOT NULL,data TEXT NOT NULL,cost INTEGER);
CREATE TABLE IF NOT EXISTS variants(id TEXT PRIMARY KEY,product_id TEXT NOT NULL REFERENCES products(id),sku TEXT UNIQUE NOT NULL,name TEXT NOT NULL,stock INTEGER NOT NULL CHECK(stock>=0));
CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY,created_at TEXT NOT NULL,email TEXT NOT NULL,customer TEXT NOT NULL,items TEXT NOT NULL,subtotal INTEGER NOT NULL,discount INTEGER NOT NULL DEFAULT 0,total INTEGER NOT NULL,state TEXT NOT NULL DEFAULT 'received',payment_state TEXT NOT NULL DEFAULT 'demo_unpaid',tracking_hash TEXT NOT NULL,idempotency_key TEXT UNIQUE NOT NULL,carrier TEXT,tracking_number TEXT,notes TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS movements(id TEXT PRIMARY KEY,variant_id TEXT REFERENCES variants(id),delta INTEGER NOT NULL,reason TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS promotions(code TEXT PRIMARY KEY,percent INTEGER NOT NULL CHECK(percent BETWEEN 1 AND 100),active INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS consents(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,created_at TEXT NOT NULL,policy_version TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS inquiries(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL,message TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS audit_logs(id TEXT PRIMARY KEY,actor TEXT NOT NULL,action TEXT NOT NULL,entity_id TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS outbox(id TEXT PRIMARY KEY,event TEXT NOT NULL,payload TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending_integration',attempts INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS rate_limits(key TEXT PRIMARY KEY,count INTEGER NOT NULL,reset_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS initialized(id INTEGER PRIMARY KEY);`);
  if (!d.prepare('SELECT id FROM initialized').get()) {
    d.exec('BEGIN IMMEDIATE');
    try {
      for (const p of seedProducts) {
        d.prepare('INSERT INTO products VALUES(?,?,?,NULL)').run(p.id, p.slug, JSON.stringify(p));
        for (const v of p.variants)
          d.prepare('INSERT INTO variants VALUES(?,?,?,?,?)').run(
            v.id,
            p.id,
            v.sku,
            v.name,
            v.stock,
          );
      }
      d.prepare('INSERT INTO initialized VALUES(1)').run();
      d.exec('COMMIT');
    } catch (e) {
      d.exec('ROLLBACK');
      throw e;
    }
  }
  database = d;
  return d;
}
function rowsProducts(activeOnly: boolean) {
  const d = db();
  const rows = d.prepare('SELECT data FROM products').all() as { data: string }[];
  return rows
    .map((r) => {
      const p = JSON.parse(r.data) as Product;
      const variants = d
        .prepare('SELECT id,name,sku,stock FROM variants WHERE product_id=?')
        .all(p.id) as Product['variants'];
      return { ...p, variants: variants.map((v) => ({ ...v })) };
    })
    .filter((p) => !activeOnly || p.active);
}
export function getProducts() {
  return rowsProducts(true);
}
export function getProduct(slug: string) {
  return getProducts().find((p) => p.slug === slug);
}
export function adminProducts() {
  return rowsProducts(false).map((p) => ({
    ...p,
    cost: (
      db().prepare('SELECT cost FROM products WHERE id=?').get(p.id) as { cost: number | null }
    ).cost,
  }));
}
function stamp() {
  return new Date().toISOString();
}
function audit(actor: string, action: string, id: string) {
  db()
    .prepare('INSERT INTO audit_logs VALUES(?,?,?,?,?)')
    .run(randomUUID(), actor, action, id, stamp());
}
function emit(event: string, payload: Record<string, unknown>) {
  db()
    .prepare('INSERT INTO outbox(id,event,payload,created_at) VALUES(?,?,?,?)')
    .run(randomUUID(), event, JSON.stringify(payload), stamp());
}
export function rateLimit(key: string, max = 10, window = 600_000) {
  const d = db();
  const now = Date.now();
  d.prepare('DELETE FROM rate_limits WHERE reset_at < ?').run(now);
  const row = d.prepare('SELECT count FROM rate_limits WHERE key=?').get(key) as
    { count: number } | undefined;
  if (row && row.count >= max)
    throw new StoreError('Demasiados intentos. Intenta de nuevo más tarde.', 429);
  d.prepare(
    'INSERT INTO rate_limits VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1',
  ).run(key, now + window);
}
function trackingSecret() {
  const file = resolve(dir(), 'tracking.key');
  if (!existsSync(file)) {
    try {
      writeFileSync(file, randomBytes(32), { mode: 0o600, flag: 'wx' });
    } catch (e) {
      if (!existsSync(file)) throw e;
    }
  }
  return readFileSync(file);
}
const hash = (s: string) => createHash('sha256').update(s).digest('hex');
function tokenFor(id: string, key: string) {
  return createHmac('sha256', trackingSecret())
    .update(id + ':' + key)
    .digest('hex');
}
export function quote(items: { variantId: string; quantity: number }[], promo = '') {
  const products = getProducts();
  const merged = new Map<string, number>();
  for (const i of items) merged.set(i.variantId, (merged.get(i.variantId) ?? 0) + i.quantity);
  const lines = [...merged].map(([id, quantity]) => {
    const p = products.find((p) => p.variants.some((v) => v.id === id));
    const v = p?.variants.find((v) => v.id === id);
    if (!p || !v) throw new StoreError('Un producto ya no está disponible.');
    if (quantity < 1 || quantity > 20 || !Number.isInteger(quantity) || quantity > v.stock)
      throw new StoreError(`Stock insuficiente: ${p.name}.`);
    return {
      productId: p.id,
      variantId: v.id,
      name: p.name,
      variant: v.name,
      sku: v.sku,
      image: p.image,
      unitPrice: p.price,
      quantity,
    };
  });
  const subtotal = lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0);
  let discount = 0;
  if (promo) {
    const p = db()
      .prepare('SELECT percent FROM promotions WHERE code=? AND active=1')
      .get(promo.trim().toUpperCase()) as { percent: number } | undefined;
    if (!p) throw new StoreError('El código no existe o no está activo.');
    discount = Math.floor((subtotal * p.percent) / 100);
  }
  return {
    lines,
    subtotal,
    discount,
    total: subtotal - discount,
    currency: 'CRC' as const,
    shipping: null,
  };
}
export function createOrder(raw: unknown) {
  const input = checkoutSchema.parse(raw);
  const d = db();
  d.exec('BEGIN IMMEDIATE');
  try {
    const old = d
      .prepare('SELECT id,total FROM orders WHERE idempotency_key=?')
      .get(input.idempotencyKey) as { id: string; total: number } | undefined;
    if (old) {
      d.exec('COMMIT');
      return { ...old, token: tokenFor(old.id, input.idempotencyKey), demo: true };
    }
    const q = quote(input.items, input.promo);
    const id = 'PG-' + randomBytes(6).toString('hex').toUpperCase();
    const token = tokenFor(id, input.idempotencyKey);
    for (const l of q.lines) {
      const result = d
        .prepare('UPDATE variants SET stock=stock-? WHERE id=? AND stock>=?')
        .run(l.quantity, l.variantId, l.quantity);
      if (result.changes !== 1) throw new StoreError('El stock cambió. Revisa tu carrito.', 409);
      d.prepare('INSERT INTO movements VALUES(?,?,?,?,?)').run(
        randomUUID(),
        l.variantId,
        -l.quantity,
        'demo_order:' + id,
        stamp(),
      );
      const remaining = d.prepare('SELECT stock FROM variants WHERE id=?').get(l.variantId) as {
        stock: number;
      };
      if (remaining.stock <= 2)
        emit('inventory.low', { variantId: l.variantId, stock: remaining.stock });
    }
    const customer = {
      name: input.name,
      phone: input.phone,
      province: input.province,
      address: input.address,
    };
    d.prepare(
      'INSERT INTO orders(id,created_at,email,customer,items,subtotal,discount,total,tracking_hash,idempotency_key) VALUES(?,?,?,?,?,?,?,?,?,?)',
    ).run(
      id,
      stamp(),
      input.email.toLowerCase(),
      JSON.stringify(customer),
      JSON.stringify(q.lines),
      q.subtotal,
      q.discount,
      q.total,
      hash(token),
      input.idempotencyKey,
    );
    emit('order.received', { orderId: id });
    d.exec('COMMIT');
    return { id, total: q.total, token, demo: true };
  } catch (e) {
    d.exec('ROLLBACK');
    throw e;
  }
}
export function trackOrder(id: string, token: string) {
  const r = db()
    .prepare(
      'SELECT id,created_at,state,payment_state,carrier,tracking_number,total FROM orders WHERE id=? AND tracking_hash=?',
    )
    .get(id, hash(token));
  if (!r) throw new StoreError('No encontramos un pedido con esos datos.', 404);
  return r;
}
export function getOrders(): Order[] {
  const rows = db()
    .prepare(
      'SELECT id,created_at,email,customer,items,total,state,payment_state,carrier,tracking_number,notes FROM orders ORDER BY created_at DESC LIMIT 200',
    )
    .all() as unknown as (Omit<Order, 'customer' | 'items'> & {
    customer: string;
    items: string;
  })[];
  return rows.map((r) => ({
    ...r,
    customer: JSON.parse(r.customer) as Order['customer'],
    items: JSON.parse(r.items) as Order['items'],
  }));
}
export function saveProduct(raw: unknown, actor: string) {
  const v = productSchema.parse(raw);
  const d = db();
  d.exec('BEGIN IMMEDIATE');
  try {
    const id = v.id || randomUUID();
    const existing = rowsProducts(false).find((p) => p.id === id);
    const variantId = existing?.variants[0]?.id ?? randomUUID();
    const p: Product = {
      id,
      slug: v.slug,
      name: v.name,
      category: v.category,
      type: v.type,
      description: v.description,
      price: v.price,
      image: v.image,
      featured: v.featured,
      active: v.active,
      createdAt: existing?.createdAt ?? stamp().slice(0, 10),
      specs: existing?.specs ?? { Material: 'Por confirmar' },
      variants: [],
    };
    d.prepare(
      'INSERT INTO products VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug,data=excluded.data,cost=excluded.cost',
    ).run(id, p.slug, JSON.stringify(p), v.cost);
    const old = existing?.variants[0]?.stock ?? 0;
    d.prepare(
      'INSERT INTO variants VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET sku=excluded.sku,name=excluded.name,stock=excluded.stock',
    ).run(variantId, id, v.sku, v.variantName, v.stock);
    if (v.stock !== old)
      d.prepare('INSERT INTO movements VALUES(?,?,?,?,?)').run(
        randomUUID(),
        variantId,
        v.stock - old,
        'admin_adjustment',
        stamp(),
      );
    audit(actor, 'product.saved', id);
    d.exec('COMMIT');
    return id;
  } catch (e) {
    d.exec('ROLLBACK');
    throw e;
  }
}
const transitions: Record<string, string[]> = {
  received: ['preparing', 'cancelled'],
  preparing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};
export function updateOrder(
  id: string,
  state: string,
  carrier: string,
  tracking: string,
  notes: string,
  actor: string,
) {
  const d = db();
  d.exec('BEGIN IMMEDIATE');
  try {
    const old = d.prepare('SELECT state,items FROM orders WHERE id=?').get(id) as
      { state: string; items: string } | undefined;
    if (!old) throw new StoreError('Pedido no encontrado.', 404);
    if (state !== old.state && !transitions[old.state]?.includes(state))
      throw new StoreError('Cambio de estado no permitido.');
    if (state === 'shipped' && (!carrier.trim() || !tracking.trim()))
      throw new StoreError('Indica transportista y número de guía.');
    if (state === 'cancelled' && old.state !== 'cancelled') {
      for (const l of JSON.parse(old.items) as { variantId: string; quantity: number }[]) {
        d.prepare('UPDATE variants SET stock=stock+? WHERE id=?').run(l.quantity, l.variantId);
        d.prepare('INSERT INTO movements VALUES(?,?,?,?,?)').run(
          randomUUID(),
          l.variantId,
          l.quantity,
          'cancelled:' + id,
          stamp(),
        );
      }
    }
    d.prepare('UPDATE orders SET state=?,carrier=?,tracking_number=?,notes=? WHERE id=?').run(
      state,
      carrier,
      tracking,
      notes,
      id,
    );
    audit(actor, 'order.' + state, id);
    if (state !== old.state) emit('order.' + state, { orderId: id });
    d.exec('COMMIT');
  } catch (e) {
    d.exec('ROLLBACK');
    throw e;
  }
}
export function subscribe(email: string) {
  db()
    .prepare('INSERT INTO consents VALUES(?,?,?,?) ON CONFLICT(email) DO NOTHING')
    .run(randomUUID(), email.toLowerCase(), stamp(), 'demo-v1');
}
export function contact(name: string, email: string, message: string) {
  db()
    .prepare('INSERT INTO inquiries VALUES(?,?,?,?,?)')
    .run(randomUUID(), name, email, message, stamp());
}
export function operations() {
  return {
    movements: db()
      .prepare('SELECT * FROM movements ORDER BY created_at DESC LIMIT 50')
      .all()
      .map((r) => ({ ...r })),
    events: db()
      .prepare(
        'SELECT id,event,status,attempts,created_at FROM outbox ORDER BY created_at DESC LIMIT 50',
      )
      .all()
      .map((r) => ({ ...r })),
    audit: db()
      .prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50')
      .all()
      .map((r) => ({ ...r })),
    inquiries: db()
      .prepare('SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 50')
      .all()
      .map((r) => ({ ...r })),
    consents: db()
      .prepare(
        'SELECT email,created_at,policy_version FROM consents ORDER BY created_at DESC LIMIT 50',
      )
      .all()
      .map((r) => ({ ...r })),
  };
}
export type CheckoutInput = z.infer<typeof checkoutSchema>;
