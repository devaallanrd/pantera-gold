import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID, randomBytes, scryptSync } from 'node:crypto';
import { spawn } from 'node:child_process';
const directory = mkdtempSync(join(tmpdir(), 'pantera-test-'));
process.env.DATA_DIR = directory;
process.env.STORE_MODE = 'demo';
const {
  db,
  getProducts,
  quote,
  createOrder,
  trackOrder,
  updateOrder,
  saveProduct,
  adminProducts,
  operations,
  rateLimit,
} = await import('../src/lib/store');
const { verifyPassword, readSession, signSession } = await import('../src/lib/auth');
const { contribution } = await import('../src/lib/integrations');
function input(variantId = 'v1', quantity = 1) {
  return {
    items: [{ variantId, quantity }],
    name: 'Cliente de prueba',
    email: 'demo@example.test',
    phone: '88888888',
    province: 'San José',
    address: 'Dirección ficticia para prueba',
    consent: true as const,
    idempotencyKey: randomUUID(),
    promo: '',
  };
}
test('catálogo público nunca contiene costos internos', () => {
  assert.equal(getProducts().length, 6);
  assert.ok(getProducts().every((p) => !('cost' in p)));
});
test('cotización usa precio del servidor y combina variantes repetidas', () => {
  const q = quote([
    { variantId: 'v1', quantity: 1 },
    { variantId: 'v1', quantity: 2 },
  ]);
  assert.equal(q.total, 85500);
  assert.equal(q.lines.length, 1);
  assert.equal(q.lines[0].quantity, 3);
});
test('rechaza productos sin stock, cantidades inválidas y códigos no activos', () => {
  assert.throws(() => quote([{ variantId: 'v6', quantity: 1 }]));
  assert.throws(() => quote([{ variantId: 'v1', quantity: -1 }]));
  assert.throws(() => quote([{ variantId: 'v1', quantity: 1 }], 'FALSO'));
});
test('promoción se valida y calcula en servidor', () => {
  db().prepare('INSERT INTO promotions VALUES(?,?,?)').run('PRUEBA', 10, 1);
  assert.equal(quote([{ variantId: 'v1', quantity: 1 }], 'prueba').discount, 2850);
});
test('pedido persiste y reintentos no duplican ni descuentan stock dos veces', () => {
  const p = input();
  const first = createOrder(p);
  const second = createOrder(p);
  assert.equal(first.id, second.id);
  assert.equal(first.token, second.token);
  assert.equal(
    (db().prepare('SELECT stock FROM variants WHERE id=?').get('v1') as { stock: number }).stock,
    7,
  );
  assert.equal(operations().events.filter((e) => e.event === 'order.received').length, 1);
});
test('validación de entrada impide pedidos sin consentimiento', () => {
  assert.throws(() => createOrder({ ...input(), consent: false }));
  assert.throws(() => createOrder({ ...input(), email: 'invalid' }));
});
test('seguimiento requiere clave privada y no expone dirección ni correo', () => {
  const o = createOrder(input());
  assert.throws(() => trackOrder(o.id, 'f'.repeat(64)));
  const publicOrder = trackOrder(o.id, o.token)!;
  assert.ok(!('email' in publicOrder));
  assert.ok(!('customer' in publicOrder));
  assert.equal(publicOrder.payment_state, 'demo_unpaid');
});
test('transacción revierte todas las líneas al fallar el stock', () => {
  const before = (
    db().prepare('SELECT stock FROM variants WHERE id=?').get('v2') as { stock: number }
  ).stock;
  assert.throws(() =>
    createOrder({
      ...input(),
      items: [
        { variantId: 'v2', quantity: 1 },
        { variantId: 'v6', quantity: 1 },
      ],
    }),
  );
  assert.equal(
    (db().prepare('SELECT stock FROM variants WHERE id=?').get('v2') as { stock: number }).stock,
    before,
  );
});
test('cancelación repone stock una sola vez y no permite reactivar pedido', () => {
  const o = createOrder(input('v2'));
  const before = (
    db().prepare('SELECT stock FROM variants WHERE id=?').get('v2') as { stock: number }
  ).stock;
  updateOrder(o.id, 'cancelled', '', '', 'prueba', 'admin');
  updateOrder(o.id, 'cancelled', '', '', 'reintento', 'admin');
  assert.equal(
    (db().prepare('SELECT stock FROM variants WHERE id=?').get('v2') as { stock: number }).stock,
    before + 1,
  );
  assert.throws(() => updateOrder(o.id, 'preparing', '', '', '', 'admin'));
});
test('no se puede saltar de recibido a entregado y el envío requiere guía', () => {
  const o = createOrder(input('v2'));
  assert.throws(() => updateOrder(o.id, 'delivered', '', '', '', 'operator'));
  updateOrder(o.id, 'preparing', '', '', '', 'operator');
  assert.throws(() => updateOrder(o.id, 'shipped', '', '', '', 'operator'));
  updateOrder(o.id, 'shipped', 'Transportista demo', 'TEST-1', '', 'operator');
  assert.equal(trackOrder(o.id, o.token)?.state, 'shipped');
});
test('edición mantiene snapshots históricos y registra inventario y auditoría', () => {
  const o = createOrder(input('v4'));
  const p = adminProducts().find((p) => p.id === 'p4')!;
  saveProduct(
    {
      id: p.id,
      name: 'Nuevo nombre demo',
      slug: p.slug,
      category: p.category,
      type: p.type,
      description: p.description,
      price: 99900,
      cost: 10000,
      image: p.image,
      stock: 9,
      featured: true,
      active: true,
      variantName: p.variants[0].name,
      sku: p.variants[0].sku,
    },
    'admin',
  );
  const row = db().prepare('SELECT items FROM orders WHERE id=?').get(o.id) as { items: string };
  assert.equal(JSON.parse(row.items)[0].name, 'Collar Aura');
  assert.equal(JSON.parse(row.items)[0].unitPrice, 32500);
  assert.ok(operations().audit.some((r) => r.action === 'product.saved'));
  assert.ok(!('cost' in getProducts().find((p) => p.id === 'p4')!));
});
test('última unidad no se sobrevende entre procesos simultáneos', async () => {
  db().prepare('UPDATE variants SET stock=1 WHERE id=?').run('v5');
  function worker() {
    return new Promise<number | null>((resolve, reject) => {
      const child = spawn(process.execPath, ['--import', 'tsx', 'tests/race-worker.ts'], {
        env: { ...process.env, DATA_DIR: directory },
        stdio: 'ignore',
      });
      child.on('error', reject);
      child.on('exit', resolve);
    });
  }
  const outcomes = await Promise.all([worker(), worker()]);
  assert.deepEqual(outcomes.sort(), [0, 2]);
  assert.equal(
    (db().prepare('SELECT stock FROM variants WHERE id=?').get('v5') as { stock: number }).stock,
    0,
  );
});
test('sesiones firmadas caducan y rechazan alteración de rol', () => {
  const salt = randomBytes(16).toString('hex');
  process.env.ADMIN_PASSWORD_HASH =
    salt + ':' + scryptSync('a-long-test-password', salt, 64).toString('hex');
  process.env.SESSION_SECRET = randomBytes(32).toString('hex');
  assert.ok(verifyPassword('a-long-test-password', process.env.ADMIN_PASSWORD_HASH));
  assert.ok(!verifyPassword('wrong', process.env.ADMIN_PASSWORD_HASH));
  const token = signSession('operator');
  assert.equal(readSession(token), 'operator');
  assert.equal(readSession(token + 'x'), null);
  const body = Buffer.from(JSON.stringify({ role: 'admin', exp: 0 })).toString('base64url');
  assert.equal(readSession(body + '.bad'), null);
});
test('limitación de intentos persiste y rechaza excesos', () => {
  rateLimit('test', 2);
  rateLimit('test', 2);
  assert.throws(() => rateLimit('test', 2));
});
test('contribución requiere todos los costos y no equivale a ventas', () => {
  assert.equal(
    contribution({
      netSale: 100,
      productCost: 20,
      paymentFee: 2,
      packaging: 1,
      shippingAbsorbed: 4,
      advertising: 3,
      other: 0,
    }),
    70,
  );
  assert.equal(
    contribution({
      netSale: 100,
      productCost: null,
      paymentFee: 2,
      packaging: 1,
      shippingAbsorbed: 4,
      advertising: 3,
      other: 0,
    }),
    null,
  );
});
test.after(() => {
  db().close();
  rmSync(directory, { recursive: true, force: true });
});
