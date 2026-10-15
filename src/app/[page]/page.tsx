import { notFound } from 'next/navigation';
import { InfoPage, infoPages } from '@/components/info-page';
export async function generateMetadata({ params }: { params: Promise<{ page: string }> }) {
  const p = infoPages[(await params).page];
  return { title: p?.title ?? 'Página no encontrada' };
}
export default async function Page({ params }: { params: Promise<{ page: string }> }) {
  const page = infoPages[(await params).page];
  if (!page) notFound();
  return <InfoPage page={page} />;
}
