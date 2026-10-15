'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty-state">
      <h1>Hagamos una pausa.</h1>
      <p>No pudimos cargar esta sección. Tu carrito sigue en este navegador.</p>
      <button className="button" onClick={reset}>
        Intentar de nuevo
      </button>
    </div>
  );
}
