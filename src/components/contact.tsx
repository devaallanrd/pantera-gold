'use client';
import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { post } from '@/lib/client';
export function Contact() {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div className="contact-layout page-shell">
      <div>
        <span className="eyebrow">CONVERSEMOS</span>
        <h1>
          Un buen detalle
          <br />
          empieza con
          <br />
          <em>una conversación.</em>
        </h1>
        <p>Consultas sobre productos, pedidos o la experiencia Pantera.</p>
        <div className="contact-note">
          <h2>Pantera Gold CR</h2>
          <p>Costa Rica</p>
          <p className="small muted">
            Teléfono, correo, horario, dirección y redes oficiales pendientes de confirmar.
          </p>
        </div>
      </div>
      <form
        className="stack-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const f = new FormData(e.currentTarget);
          try {
            const p = await post<{ message: string }>('/api/contact', {
              name: f.get('name'),
              email: f.get('email'),
              message: f.get('message'),
              consent: f.get('consent') === 'on',
            });
            setMessage(p.message);
          } catch (e) {
            setMessage((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <p className="demo-note">
          Formulario de prueba. Usá datos ficticios; no se envían correos.
        </p>
        <label>
          Tu nombre
          <input name="name" required minLength={2} maxLength={100} />
        </label>
        <label>
          Correo electrónico
          <input name="email" type="email" required maxLength={160} />
        </label>
        <label>
          ¿En qué te ayudamos?
          <textarea name="message" required minLength={10} maxLength={2000} rows={5} />
        </label>
        <label className="checkbox small">
          <input type="checkbox" name="consent" required />
          Acepto guardar mi consulta de prueba según la privacidad provisional.
        </label>
        <button className="button" disabled={busy}>
          {busy ? 'Guardando…' : 'Guardar consulta de prueba'}
          <ArrowUpRight size={17} />
        </button>
        <p role="status">{message}</p>
      </form>
    </div>
  );
}
