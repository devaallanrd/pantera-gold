'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole, ArrowRight } from 'lucide-react';
import { post } from '@/lib/client';
export function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div className="narrow-page">
      <LockKeyhole size={27} />
      <span className="eyebrow">ACCESO PRIVADO</span>
      <h1>Administración.</h1>
      <p>Este espacio está reservado para el equipo autorizado de Pantera Gold CR.</p>
      {!configured && (
        <div className="notice">
          Administración cerrada hasta configurar credenciales del servidor. Consultá README y
          ejecutá <code>npm run admin:password</code>. No hay contraseña predeterminada.
        </div>
      )}
      <form
        className="stack-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setBusy(true);
          try {
            await post('/api/admin/login', { role: f.get('role'), password: f.get('password') });
            router.refresh();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Perfil
          <select name="role">
            <option value="admin">Administración</option>
            <option value="operator">Operaciones</option>
          </select>
        </label>
        <label>
          Contraseña
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={200}
          />
        </label>
        <button disabled={!configured || busy} className="button">
          {busy ? 'Validando…' : 'Entrar'} <ArrowRight size={17} />
        </button>
        <p role="alert" className="error">
          {error}
        </p>
      </form>
    </div>
  );
}
