import { notFound } from 'next/navigation';
import { getProduct, getProducts } from '@/lib/store';
import { ProductDetail } from '@/components/product-detail';
import { ProductCard } from '@/components/product-card';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProduct((await params).slug);
  return { title: p?.name ?? 'Producto no encontrado', description: p?.description };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const related = getProducts()
    .filter((x) => x.id !== p.id)
    .sort((a, b) => Number(b.category === p.category) - Number(a.category === p.category))
    .slice(0, 4);
  return (
    <div className="page-shell">
      <ProductDetail product={p} />
      <section className="related">
        <span className="eyebrow">COMPLETÁ TU ESTILO</span>
        <h2>Detalles que se encuentran.</h2>
        <div className="product-grid">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
