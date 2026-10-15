'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Check, GitCompareArrows } from 'lucide-react';
import { type Product, money, categories } from '@/lib/catalog';
import { useStore } from './store-provider';
export function ProductCard({ product: p }: { product: Product }) {
  const { add, compare, toggleCompare } = useStore();
  const v = p.variants.find((v) => v.stock > 0);
  return (
    <article className="product-card">
      <div className="product-photo">
        <Link href={'/producto/' + p.slug}>
          <Image
            src={p.image}
            alt={`${p.name}: imagen conceptual de demostración`}
            fill
            sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw"
          />
        </Link>
        <span className="product-tag">DEMO</span>
        <button
          className={'compare-button ' + (compare.includes(p.id) ? 'selected' : '')}
          onClick={() => toggleCompare(p.id)}
          aria-label={`${compare.includes(p.id) ? 'Quitar' : 'Agregar'} ${p.name} ${compare.includes(p.id) ? 'de' : 'a'} comparación`}
          title="Comparar hasta 3 productos"
        >
          {compare.includes(p.id) ? <Check size={16} /> : <GitCompareArrows size={16} />}
        </button>
        <button
          className="quick-add"
          aria-label={`Agregar ${p.name} al carrito`}
          disabled={!v}
          onClick={() => v && add(v.id, 1)}
        >
          {v ? (
            <>
              <Plus size={15} /> Agregar al carrito
            </>
          ) : (
            'Sin stock de muestra'
          )}
        </button>
      </div>
      <div className="product-meta">
        <span>
          {categories.find((c) => c.slug === p.category)?.name} <span className="dot">/</span>{' '}
          {p.type}
        </span>
        <Link href={'/producto/' + p.slug}>
          <h3>{p.name}</h3>
        </Link>
        <div className="product-price">
          {money(p.price)} <small>Precio demo</small>
        </div>
      </div>
    </article>
  );
}
