'use client';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
export function Newsletter() {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <section className="newsletter">
      <div>
        <span className="eyebrow">EL CÍRCULO PANTERA</span>
        <h2>Algo especial está por llegar.</h2>
        <p>Novedades y nuevas selecciones, a tu ritmo.</p>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const data = new FormData(e.currentTarget);
          try {
            const r = await fetch('/api/newsletter', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: data.get('email'),
                consent: data.get('consent') === 'on',
              }),
            });
            const p = await r.json();
            setMessage(p.message ?? p.error);
          } catch {
            setMessage('No se pudo conectar. Inténtalo de nuevo.');
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="email-input">
          <label className="sr-only" htmlFor="newsletter-email">
            Tu correo electrónico
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            placeholder="Tu correo electrónico"
            required
          />
          <button disabled={busy} aria-label="Suscribirme a novedades">
            <ArrowRight size={22} />
          </button>
        </div>
        <label className="checkbox small">
          <input type="checkbox" name="consent" required />
          Acepto guardar mi correo para novedades. Puedo retirar mi consentimiento.
        </label>
        <p className="small muted">
          Demostración: no se envían campañas. <a href="/privacidad">Privacidad</a>
        </p>
        <p role="status" className="form-status">
          {message}
        </p>
      </form>
    </section>
  );
}
