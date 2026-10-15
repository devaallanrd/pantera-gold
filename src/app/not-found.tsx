import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="empty-state">
      <span className="eyebrow">404 · UN NUEVO CAMINO</span>
      <h1>Este detalle no está aquí.</h1>
      <p>La página que buscás no existe o ya no está disponible.</p>
      <Link className="button" href="/catalogo">
        Volver a la colección →
      </Link>
    </div>
  );
}
