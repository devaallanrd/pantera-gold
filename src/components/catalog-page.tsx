import { Suspense } from 'react';
import Link from 'next/link';
import { categories } from '@/lib/catalog';
import { getProducts } from '@/lib/store';
import { Catalog } from './catalog';
export function CatalogPage({ category }: { category?: string }) {
  const c = categories.find((c) => c.slug === category);
  return (
    <div className="page-shell">
      <nav className="breadcrumbs">
        <Link href="/">Inicio</Link>
        <span>/</span>
        <span>{c?.name ?? 'Colección'}</span>
      </nav>
      <div className="page-title">
        <span className="eyebrow">EL UNIVERSO PANTERA</span>
        <h1>{c?.name ?? 'Cada detalle, una elección.'}</h1>
        <p>{c?.label ?? 'Joyería, relojes y fragancias para explorar tu estilo.'}</p>
      </div>
      <p className="demo-note">
        Productos, precios, imágenes y stock de demostración. Sin ventas reales.
      </p>
      <Suspense fallback={<p>Cargando colección…</p>}>
        <Catalog products={getProducts()} category={category} />
      </Suspense>
    </div>
  );
}
