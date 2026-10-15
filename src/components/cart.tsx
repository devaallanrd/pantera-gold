'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ArrowRight, ShoppingBag, Trash2, LockKeyhole } from 'lucide-react';
import { type Product, money } from '@/lib/catalog';
import { useStore, useCartProducts } from './store-provider';
import { post } from '@/lib/client';
export function Cart({ products }: { products: Product[] }) {
  const { items, update, ready } = useStore();
  const lines = useCartProducts(products);
  const [promo, setPromo] = useState('');
  const [message, setMessage] = useState('');
  const [discount, setDiscount] = useState(0);
  const subtotal = lines.reduce((n, l) => n + (l.product?.price ?? 0) * l.quantity, 0);
  const invalid = lines.some((l) => !l.product || !l.variant || l.quantity > l.variant.stock);
  if (!ready) return <p className="page-shell">Cargando carrito…</p>;
  if (!items.length)
    return (
      <div className="empty-state">
        <ShoppingBag size={36} />
        <h1>Un espacio para tus favoritos.</h1>
        <p>Tu carrito está vacío. Encontrá ese detalle que habla de vos.</p>
        <Link href="/catalogo" className="button">
          Explorar la colección <ArrowRight size={17} />
        </Link>
      </div>
    );
  return (
    <div className="page-shell">
      <nav className="breadcrumbs">
        <Link href="/">Inicio</Link>
        <span>/</span>
        <span>Carrito</span>
      </nav>
      <div className="page-title">
        <span className="eyebrow">TUS ELECCIONES</span>
        <h1>Tu carrito.</h1>
        <p>Un detalle más cerca de tu estilo.</p>
      </div>
      <div className="cart-layout">
        <div className="cart-lines">
          {lines.map((l) => (
            <article className="cart-line" key={l.variantId}>
              {l.product ? (
                <>
                  <Link className="cart-thumb" href={'/producto/' + l.product.slug}>
                    <Image
                      src={l.product.image}
                      alt={l.product.name + ' · imagen conceptual'}
                      fill
                      sizes="120px"
                    />
                  </Link>
                  <div>
                    <span className="eyebrow">DEMO</span>
                    <Link href={'/producto/' + l.product.slug}>
                      <h2>{l.product.name}</h2>
                    </Link>
                    <p className="small muted">{l.variant?.name}</p>
                    <strong>{money(l.product.price)}</strong>
                    {l.quantity > (l.variant?.stock ?? 0) && (
                      <p className="error small">Cantidad no disponible. Ajustá tu selección.</p>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <h2>Producto no disponible</h2>
                  <p>Eliminalo para continuar.</p>
                </div>
              )}
              <div className="cart-line-actions">
                <label className="sr-only" htmlFor={l.variantId}>
                  Cantidad de {l.product?.name}
                </label>
                <input
                  id={l.variantId}
                  type="number"
                  min="1"
                  max={Math.min(20, l.variant?.stock ?? 20)}
                  value={l.quantity}
                  onChange={(e) => {
                    update(l.variantId, Number(e.target.value));
                    setDiscount(0);
                  }}
                />
                <button
                  className="icon-button"
                  onClick={() => {
                    update(l.variantId, 0);
                    setDiscount(0);
                  }}
                  aria-label={'Eliminar ' + l.product?.name}
                >
                  <Trash2 size={17} />
                </button>
              </div>
              <strong>{money((l.product?.price ?? 0) * l.quantity)}</strong>
            </article>
          ))}
          <Link href="/catalogo" className="text-link">
            Seguir explorando <ArrowRight size={16} />
          </Link>
        </div>
        <aside className="order-summary">
          <h2>Tu selección</h2>
          <div>
            <span>Subtotal</span>
            <strong>{money(subtotal)}</strong>
          </div>
          <div>
            <span>Descuento</span>
            <span>−{money(discount)}</span>
          </div>
          <div>
            <span>Envío</span>
            <span>Por confirmar</span>
          </div>
          <form
            className="promo-form"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const q = await post<{ discount: number }>('/api/quote', { items, promo });
                setDiscount(q.discount);
                setMessage('Código validado. Ingresalo también en checkout.');
              } catch (e) {
                setDiscount(0);
                setMessage((e as Error).message);
              }
            }}
          >
            <label htmlFor="promo">Código promocional</label>
            <div>
              <input
                id="promo"
                value={promo}
                onChange={(e) => {
                  setPromo(e.target.value);
                  setDiscount(0);
                }}
                placeholder="Tu código"
                maxLength={40}
              />
              <button className="text-link">Aplicar</button>
            </div>
            <p role="status" className="small">
              {message}
            </p>
          </form>
          <div className="summary-total">
            <span>Total de artículos</span>
            <strong>{money(subtotal - discount)}</strong>
          </div>
          <p className="small muted">CRC · precios de demostración. No incluye un envío real.</p>
          {invalid ? (
            <p role="alert" className="error">
              Revisá los artículos sin stock antes de continuar.
            </p>
          ) : (
            <Link href="/checkout" className="button">
              Continuar al checkout <ArrowRight size={17} />
            </Link>
          )}
          <p className="secure-note">
            <LockKeyhole size={14} /> Demostración sin cobros reales
          </p>
        </aside>
      </div>
    </div>
  );
}
