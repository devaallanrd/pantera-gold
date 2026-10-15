'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Check, Minus, Plus, MessageCircle } from 'lucide-react';
import { type Product, money, categories } from '@/lib/catalog';
import { useStore } from './store-provider';
export function ProductDetail({ product: p }: { product: Product }) {
  const [variant, setVariant] = useState(p.variants[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { add } = useStore();
  const v = p.variants.find((x) => x.id === variant);
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  return (
    <>
      <nav className="breadcrumbs">
        <Link href="/">Inicio</Link>
        <span>/</span>
        <Link href={'/' + p.category}>{categories.find((c) => c.slug === p.category)?.name}</Link>
        <span>/</span>
        <span>{p.name}</span>
      </nav>
      <div className="product-detail">
        <div className="detail-gallery">
          <div className="detail-image">
            <Image
              src={p.image}
              alt={`${p.name}, fotografía conceptual de demostración`}
              fill
              priority
              sizes="(max-width: 800px) 100vw, 55vw"
            />
            <span className="product-tag">IMAGEN CONCEPTUAL</span>
          </div>
          <p className="small muted">
            Referencia visual generada. No representa un artículo comercial verificado.
          </p>
        </div>
        <div className="detail-copy">
          <span className="eyebrow">{p.type} · DEMOSTRACIÓN</span>
          <h1>{p.name}</h1>
          <div className="detail-price">
            {money(p.price)} <small>Precio de ejemplo · CRC</small>
          </div>
          <p>{p.description}</p>
          <span className={'stock ' + (v?.stock ? '' : 'out')}>
            {v?.stock ? `${v.stock} unidades de muestra disponibles` : 'Sin stock de muestra'}
          </span>
          <label>
            Presentación
            <select
              value={variant}
              onChange={(e) => {
                setVariant(e.target.value);
                setQuantity(1);
              }}
            >
              {p.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>
          <div className="purchase-row">
            <div className="quantity">
              <button
                aria-label="Disminuir cantidad"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={15} />
              </button>
              <span>{quantity}</span>
              <button
                aria-label="Aumentar cantidad"
                disabled={!v || quantity >= Math.min(v.stock, 20)}
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus size={15} />
              </button>
            </div>
            <button
              className="button"
              disabled={!v?.stock}
              onClick={() => {
                add(variant, quantity);
                setAdded(true);
              }}
            >
              {added ? (
                <>
                  <Check size={17} /> Agregado
                </>
              ) : (
                <>
                  Agregar al carrito <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>
          {added && (
            <Link className="text-link" href="/carrito">
              Ver mi carrito <ArrowRight size={16} />
            </Link>
          )}
          <p className="demo-note">
            No se realizan cobros. El stock se verifica de nuevo al crear un pedido de demostración.
          </p>
          {number && /^\d{8,15}$/.test(number) ? (
            <a
              className="text-link"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://wa.me/${number}?text=${encodeURIComponent('Hola, quisiera consultar por ' + p.name + ' (demostración).')}`}
            >
              <MessageCircle size={17} /> Consultar por WhatsApp
            </a>
          ) : (
            <Link href="/contacto" className="text-link">
              <MessageCircle size={17} /> Consultar sobre esta pieza
            </Link>
          )}
          <div className="detail-accordions">
            <details open>
              <summary>Características</summary>
              <dl>
                {Object.entries(p.specs).map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
                <div>
                  <dt>SKU</dt>
                  <dd>{v?.sku}</dd>
                </div>
              </dl>
            </details>
            <details>
              <summary>Entregas y cambios</summary>
              <p>
                Las zonas, tarifas, plazos y condiciones están pendientes de confirmar por el
                comercio. Esta demostración no genera envíos reales.
              </p>
              <Link href="/politica-de-envios">Información de envíos</Link>
            </details>
            <details>
              <summary>¿Puedo comprar este producto?</summary>
              <p>
                El catálogo es ilustrativo. Podés probar el carrito y generar un pedido de
                demostración, sin pagar ni reservar mercancía real.
              </p>
            </details>
          </div>
        </div>
      </div>
    </>
  );
}
