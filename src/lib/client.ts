export async function post<T = Record<string, unknown>>(url: string, data: unknown): Promise<T> {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const p = await r.json();
  if (!r.ok) throw Error(p.error ?? 'No se pudo completar la solicitud.');
  return p as T;
}
export const stateLabels: Record<string, string> = {
  received: 'Pedido recibido',
  preparing: 'En preparación',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  demo_unpaid: 'Sin cobro · demostración',
};
