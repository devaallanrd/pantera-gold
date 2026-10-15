'use client';
import { useState } from 'react';
import { PackageCheck, Search } from 'lucide-react';
import { post, stateLabels } from '@/lib/client';
import { money } from '@/lib/catalog';
type Tracking = {
  id: string;
  state: string;
  payment_state: string;
  total: number;
  carrier: string | null;
  tracking_number: string | null;
};
export function Tracking() {
  const [result, setResult] = useState<Tracking | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div className="narrow-page">
      <span className="eyebrow">TE ACOMPAÑAMOS</span>
      <h1>Cada paso de tu pedido.</h1>
      <p>
        Usá el número de pedido y la clave privada recibida al crearlo. No mostramos direcciones ni
        datos personales en esta consulta.
      </p>
      <form
        className="stack-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setBusy(true);
          setError('');
          setResult(null);
          try {
            setResult(
              await post<Tracking>('/api/tracking', { id: f.get('id'), token: f.get('token') }),
            );
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Número de pedido
          <input name="id" placeholder="PG-…" required maxLength={40} />
        </label>
        <label>
          Clave privada de seguimiento
          <input
            name="token"
            type="password"
            required
            minLength={64}
            maxLength={64}
            autoComplete="off"
          />
        </label>
        <button className="button" disabled={busy}>
          <Search size={16} /> {busy ? 'Consultando…' : 'Consultar pedido'}
        </button>
        <p role="alert" className="error">
          {error}
        </p>
      </form>
      {result && (
        <div className="tracking-result" role="status">
          <PackageCheck />
          <h2>{result.id}</h2>
          <p>{stateLabels[result.state]}</p>
          <p>{stateLabels[result.payment_state]}</p>
          <p>Total demo: {money(result.total)}</p>
          {result.carrier && (
            <p>
              Transportista de prueba: {result.carrier} · {result.tracking_number}
            </p>
          )}
          <ol className="tracking-steps">
            {['received', 'preparing', 'shipped', 'delivered'].map((s) => (
              <li className={result.state === s ? 'current' : ''} key={s}>
                {stateLabels[s]}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
