'use client';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { ArrowRight, Check, LockKeyhole } from 'lucide-react';
import { type Product, money } from '@/lib/catalog';
import { useStore, useCartProducts } from './store-provider';
import { post } from '@/lib/client';
export function Checkout({ products }: { products: Product[] }) {
  const { items, clear, ready } = useStore();
  const lines = useCartProducts(products);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ id: string; token: string; total: number } | null>(null);
  const key = useRef<string>('');
  const [promo, setPromo] = useState('');
  const [quote, setQuote] = useState<{ total: number; discount: number } | null>(null);
  const subtotal = lines.reduce((n, l) => n + (l.product?.price ?? 0) * l.quantity, 0);
  if (result)
    return (
      <div className="confirmation page-shell">
        <span className="success-circle">
          <Check size={28} />
        </span>
        <span className="eyebrow">DEMOSTRACIÓN COMPLETADA</span>
        <h1>
          Tu pedido de prueba
          <br />
          ya tiene su lugar.
        </h1>
        <p>No realizamos ningún cobro ni envío. El pedido quedó guardado en la base local.</p>
        <div className="confirmation-card">
          <h2>{result.id}</h2>
          <p>Total de artículos: {money(result.total)}</p>
          <p>Estado: recibido · Sin pago real</p>
          <label>
            Clave privada de seguimiento
            <input readOnly value={result.token} onFocus={(e) => e.target.select()} />
          </label>
          <p className="small">
            Guardá esta clave: solo se muestra al crear el pedido. No la compartás públicamente.
          </p>
          <Link href="/seguimiento" className="button">
            Consultar mi pedido <ArrowRight size={16} />
          </Link>
        </div>
        <p className="small muted">
          El envío de correo está pendiente de integración. Esta pantalla es tu confirmación.
        </p>
      </div>
    );
  if (!ready) return <div className="page-shell">Cargando…</div>;
  if (!items.length)
    return (
      <div className="empty-state">
        <h1>Primero, elegí tu detalle.</h1>
        <Link href="/catalogo" className="button">
          Explorar productos
        </Link>
      </div>
    );
  return (
    <div className="page-shell">
      <nav className="breadcrumbs">
        <Link href="/carrito">Carrito</Link>
        <span>/</span>
        <span>Checkout de demostración</span>
      </nav>
      <div className="page-title">
        <span className="eyebrow">EL ÚLTIMO DETALLE</span>
        <h1>Completá tu pedido de prueba.</h1>
        <p>Comprá como invitado. Usá datos ficticios para explorar esta demostración.</p>
      </div>
      <form
        className="checkout-layout"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError('');
          const f = new FormData(e.currentTarget);
          if (!key.current) key.current = crypto.randomUUID();
          try {
            const result = await post<{ id: string; token: string; total: number }>(
              '/api/checkout',
              {
                items,
                name: f.get('name'),
                email: f.get('email'),
                phone: f.get('phone'),
                province: f.get('province'),
                address: f.get('address'),
                consent: f.get('consent') === 'on',
                promo,
                idempotencyKey: key.current,
              },
            );
            setResult(result);
            clear();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="checkout-fields">
          <section>
            <span className="step-number">01</span>
            <h2>Datos de contacto</h2>
            <div className="form-grid">
              <label className="full">
                Nombre completo
                <input name="name" autoComplete="name" required minLength={2} maxLength={100} />
              </label>
              <label>
                Correo electrónico
                <input name="email" type="email" autoComplete="email" required maxLength={160} />
              </label>
              <label>
                Teléfono
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  pattern="[+0-9 -]{8,20}"
                  required
                />
              </label>
            </div>
          </section>
          <section>
            <span className="step-number">02</span>
            <h2>Dirección de ejemplo</h2>
            <div className="form-grid">
              <label className="full">
                Provincia
                <select name="province">
                  {[
                    'San José',
                    'Alajuela',
                    'Cartago',
                    'Heredia',
                    'Guanacaste',
                    'Puntarenas',
                    'Limón',
                  ].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
              <label className="full">
                Cantón, distrito y dirección
                <textarea
                  name="address"
                  autoComplete="street-address"
                  minLength={12}
                  maxLength={500}
                  required
                  placeholder="Usá una dirección ficticia en esta demostración"
                />
              </label>
            </div>
            <p className="small muted">
              Entrega simulada. Tarifas y cobertura comercial pendientes de confirmar.
            </p>
          </section>
          <section>
            <span className="step-number">03</span>
            <h2>Método de pago</h2>
            <div className="payment-demo">
              <LockKeyhole size={20} />
              <div>
                <strong>Sin pago · modo demostración</strong>
                <p>
                  No solicitamos tarjetas, transferencias ni SINPE Móvil. Este pedido nunca se
                  marcará como pagado.
                </p>
              </div>
            </div>
          </section>
          <label className="checkbox">
            <input name="consent" type="checkbox" required />
            Entiendo que es una demostración y acepto el tratamiento de los datos de prueba conforme
            a los <Link href="/terminos">términos</Link> y la{' '}
            <Link href="/privacidad">privacidad provisional</Link>.
          </label>
        </div>
        <aside className="order-summary">
          <h2>Resumen del pedido</h2>
          {lines.map((l) => (
            <div key={l.variantId}>
              <span>
                {l.product?.name ?? 'No disponible'} × {l.quantity}
              </span>
              <strong>{money((l.product?.price ?? 0) * l.quantity)}</strong>
            </div>
          ))}
          <div>
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          <div>
            <span>Envío</span>
            <span>No aplicable · demo</span>
          </div>
          <label>
            Código promocional
            <input
              value={promo}
              maxLength={40}
              onChange={(e) => {
                setPromo(e.target.value);
                setQuote(null);
                key.current = '';
              }}
            />
          </label>
          <button
            type="button"
            className="text-link"
            onClick={async () => {
              try {
                setQuote(await post('/api/quote', { items, promo }));
                setError('');
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            Validar código
          </button>
          {quote && (
            <div>
              <span>Descuento validado</span>
              <span>−{money(quote.discount)}</span>
            </div>
          )}
          <div className="summary-total">
            <span>Total demo</span>
            <strong>{money(quote?.total ?? subtotal)}</strong>
          </div>
          <p className="small muted">El servidor confirmará precios y existencias al guardar.</p>
          <p role="alert" className="error">
            {error}
          </p>
          <button className="button" disabled={busy}>
            {busy ? 'Guardando…' : 'Crear pedido de demostración'} <ArrowRight size={16} />
          </button>
          <p className="secure-note">Sin cobros · Sin envíos · Datos de prueba</p>
        </aside>
      </form>
    </div>
  );
}
