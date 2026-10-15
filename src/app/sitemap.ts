import type { MetadataRoute } from 'next';
import { getProducts } from '@/lib/store';
import { infoPages } from '@/components/info-page';
export const dynamic = 'force-dynamic';
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return [
    '',
    '/catalogo',
    '/joyeria',
    '/relojes',
    '/colonias',
    '/contacto',
    ...Object.keys(infoPages).map((p) => '/' + p),
    ...getProducts().map((p) => '/producto/' + p.slug),
  ].map((p) => ({ url: base + p }));
}
