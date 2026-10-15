'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  ListChecks,
  LogOut,
  Plus,
  ArrowUpRight,
} from 'lucide-react';
import { money } from '@/lib/catalog';
import { post, stateLabels } from '@/lib/client';
import type { Role } from '@/lib/auth';
import type { AdminProduct, Order, Operations } from './admin/types';
import { OrderEditor } from './admin/order-editor';
import { ProductForm } from './admin/product-form';
export function AdminPanel({
  products,
  orders,
  operations,
  role,
}: {
  products: AdminProduct[];
  orders: Order[];
  operations: Operations;
  role: Role;
}) {
  const router = useRouter();
  const [tab, setTab] = useState('dashboard');
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState<AdminProduct | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const low = products.filter((p) => p.variants.some((v) => v.stock <= 2));
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      await post('/api/admin/products', {
        id: editing?.id,
        name: f.get('name'),
        slug: f.get('slug'),
        category: f.get('category'),
        type: f.get('type'),
        description: f.get('description'),
        price: Number(f.get('price')),
        cost: f.get('cost') === '' ? null : Number(f.get('cost')),
        image: f.get('image'),
        stock: Number(f.get('stock')),
        sku: f.get('sku'),
        variantName: f.get('variantName'),
        featured: f.get('featured') === 'on',
        active: f.get('active') === 'on',
      });
      setEditing(undefined);
      setMessage('Producto guardado y movimiento registrado.');
      router.refresh();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <span className="eyebrow">PANTERA / ESTUDIO</span>
        <h2>Administración</h2>
        <p className="small">Perfil: {role === 'admin' ? 'Administración' : 'Operaciones'}</p>
        {[
          { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
          { id: 'products', label: 'Productos', icon: Package },
          { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
          { id: 'operations', label: 'Operación y registros', icon: ListChecks },
        ]
          .filter((t) => role === 'admin' || t.id !== 'products')
          .map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? 'active' : ''}
              onClick={() => {
                setTab(t.id);
                setEditing(undefined);
              }}
            >
              <t.icon size={17} />
              {t.label}
            </button>
          ))}
        <button
          onClick={async () => {
            await post('/api/admin/logout', {});
            router.refresh();
          }}
        >
          <LogOut size={17} /> Cerrar sesión
        </button>
      </aside>
      <div className="admin-content">
        <div className="admin-title">
          <div>
            <span className="eyebrow">ENTORNO DE DEMOSTRACIÓN</span>
            <h1>
              {tab === 'dashboard'
                ? 'Una mirada a tu negocio.'
                : tab === 'products'
                  ? 'Tu catálogo.'
                  : tab === 'orders'
                    ? 'Cada pedido cuenta.'
                    : 'Todo, en su lugar.'}
            </h1>
          </div>
          <a href="/" className="text-link">
            Ver tienda <ArrowUpRight size={15} />
          </a>
        </div>
        <p className="notice">
          Datos locales de prueba. No hay cobros, envíos ni notificaciones reales. Las métricas
          comerciales permanecen en cero.
        </p>
        <p role="status" className="form-status">
          {message}
        </p>
        {tab === 'dashboard' && (
          <>
            <div className="metrics">
              {[
                ['Ventas confirmadas', money(0)],
                ['Pedidos de prueba', String(orders.length)],
                ['Ticket pagado', 'Sin pagos'],
                ['Contribución', 'Sin costos reales'],
              ].map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <small>Demostración</small>
                </div>
              ))}
            </div>
            <div className="dashboard-grid">
              <section className="admin-box">
                <h2>Actividad de prueba</h2>
                <div className="bar-chart" aria-label="Pedidos de demostración por estado">
                  {['received', 'preparing', 'shipped', 'delivered', 'cancelled'].map((state) => {
                    const n = orders.filter((o) => o.state === state).length;
                    return (
                      <div key={state}>
                        <span>{stateLabels[state]}</span>
                        <div>
                          <i
                            style={{
                              width: `${Math.max(orders.length ? (n / orders.length) * 100 : 0, 1)}%`,
                            }}
                          />
                        </div>
                        <strong>{n}</strong>
                      </div>
                    );
                  })}
                </div>
                <p className="small muted">No equivale a evolución de ventas ni ingresos.</p>
              </section>
              <section className="admin-box">
                <h2>Atención al inventario</h2>
                {low.length ? (
                  low.map((p) => (
                    <p key={p.id}>
                      {p.name} <strong>{p.variants.reduce((n, v) => n + v.stock, 0)} uds.</strong>
                    </p>
                  ))
                ) : (
                  <p>No hay alertas de muestra.</p>
                )}
                <h3>Analítica comercial</h3>
                <p className="small muted">
                  Conversión, adquisición, rotación y contribución: no disponibles hasta integrar
                  eventos, costos y pagos verificados.
                </p>
              </section>
            </div>
            <section className="admin-box">
              <h2>Pedidos pendientes</h2>
              <p>
                {orders.filter((o) => o.state === 'received').length} pedidos de demostración
                recibidos.
              </p>
              <p className="small muted">
                Contribución = venta neta − producto − comisión − empaque − envío asumido −
                publicidad atribuible − otros costos variables.
              </p>
            </section>
          </>
        )}
        {tab === 'products' && role === 'admin' && (
          <>
            {editing === undefined ? (
              <>
                <button className="button" onClick={() => setEditing(null)}>
                  <Plus size={16} /> Crear producto demo
                </button>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Producto / SKU</th>
                        <th>Precio</th>
                        <th>Costo privado</th>
                        <th>Stock</th>
                        <th>Estado</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id}>
                          <td>
                            {p.name}
                            <small>{p.variants[0]?.sku}</small>
                          </td>
                          <td>{money(p.price)}</td>
                          <td>{p.cost === null ? 'Sin definir' : money(p.cost)}</td>
                          <td>{p.variants[0]?.stock}</td>
                          <td>{p.active ? 'Activo' : 'Archivado'}</td>
                          <td>
                            <button className="text-link" onClick={() => setEditing(p)}>
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <ProductForm
                editing={editing}
                save={save}
                busy={busy}
                onCancel={() => setEditing(undefined)}
              />
            )}
          </>
        )}
        {tab === 'orders' && (
          <>
            <div className="order-filters">
              <label>
                Estado
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">Todos</option>
                  {Object.entries(stateLabels)
                    .filter(([k]) => k !== 'demo_unpaid')
                    .map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Desde
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </label>
            </div>
            {orders
              .filter(
                (o) =>
                  (!status || o.state === status) && (!date || o.created_at.slice(0, 10) >= date),
              )
              .map((o) => (
                <OrderEditor
                  key={o.id}
                  order={o}
                  onSave={(m) => {
                    setMessage(m);
                    router.refresh();
                  }}
                />
              ))}
            {!orders.length && (
              <div className="empty-state">
                <h2>Aún no hay pedidos de prueba.</h2>
                <p>Creá uno desde el checkout para validar el flujo.</p>
              </div>
            )}
          </>
        )}
        {tab === 'operations' && (
          <>
            {(role === 'admin'
              ? Object.entries(operations)
              : Object.entries(operations).filter(([k]) =>
                  ['movements', 'events', 'inquiries'].includes(k),
                )
            ).map(([name, rows]) => (
              <section key={name} className="admin-box">
                <h2>
                  {
                    {
                      movements: 'Movimientos de inventario',
                      events: 'Eventos pendientes de integración',
                      audit: 'Auditoría administrativa',
                      inquiries: 'Consultas guardadas',
                      consents: 'Consentimientos de novedades',
                    }[name]
                  }
                </h2>
                {rows.length ? (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          {Object.keys(rows[0]).map((k) => (
                            <th key={k}>{k}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r, i) => (
                          <tr key={i}>
                            {Object.values(r).map((v, j) => (
                              <td key={j}>{String(v ?? '—')}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="small muted">Sin registros.</p>
                )}
              </section>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
