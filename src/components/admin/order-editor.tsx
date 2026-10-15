'use client';
import { useState } from 'react';
import { money } from '@/lib/catalog';
import { post, stateLabels } from '@/lib/client';
import type { Order } from './types';
export function OrderEditor({ order: o, onSave }: { order: Order; onSave: (m: string) => void }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <details className="admin-box order-editor">
      <summary>
        <strong>{o.id}</strong>
        <span>{new Date(o.created_at).toLocaleDateString('es-CR')}</span>
        <span>{stateLabels[o.state]}</span>
        <strong>{money(o.total)}</strong>
      </summary>
      <div className="order-details">
        <p>
          {o.customer.name} · {o.email} · {o.customer.phone}
        </p>
        <p>
          {o.customer.province} · {o.customer.address}
        </p>
        <p>Pago: {stateLabels[o.payment_state]} (no editable)</p>
        <ul>
          {o.items.map((i, n) => (
            <li key={n}>
              {i.name} · {i.sku} · {i.quantity} × {money(i.unitPrice)}
            </li>
          ))}
        </ul>
        <form
          className="form-grid"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const f = new FormData(e.currentTarget);
            try {
              await post('/api/admin/orders', {
                id: o.id,
                state: f.get('state'),
                carrier: f.get('carrier'),
                tracking: f.get('tracking'),
                notes: f.get('notes'),
              });
              onSave('Pedido actualizado. Evento registrado; notificación aún no conectada.');
              setError('');
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Estado
            <select name="state" defaultValue={o.state}>
              {['received', 'preparing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                <option key={s} value={s}>
                  {stateLabels[s]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Transportista de prueba
            <input name="carrier" defaultValue={o.carrier ?? ''} maxLength={100} />
          </label>
          <label>
            Guía de prueba
            <input name="tracking" defaultValue={o.tracking_number ?? ''} maxLength={100} />
          </label>
          <label className="full">
            Notas internas
            <textarea name="notes" defaultValue={o.notes} maxLength={1000} />
          </label>
          <button className="button" disabled={busy}>
            {busy ? 'Guardando…' : 'Actualizar pedido'}
          </button>
          <p className="error" role="alert">
            {error}
          </p>
        </form>
      </div>
    </details>
  );
}
