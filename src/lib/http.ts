import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { StoreError } from './schemas';
import { rateLimit } from './store';
import { getRole } from './auth';
import { isAllowedOrigin } from './origin';
export function failure(e: unknown) {
  if (e instanceof ZodError)
    return NextResponse.json(
      { error: 'Revisa los campos del formulario.', fields: e.issues.map((i) => i.path.join('.')) },
      { status: 400 },
    );
  if (e instanceof StoreError) return NextResponse.json({ error: e.message }, { status: e.status });
  console.error('store_operation_failed', e instanceof Error ? e.name : 'Unknown');
  return NextResponse.json(
    { error: 'No se pudo completar la operación. Inténtalo de nuevo.' },
    { status: 500 },
  );
}
export async function body(request: Request) {
  const origin = request.headers.get('origin');
  if (!isAllowedOrigin(origin, request.headers.get('host')))
    throw new StoreError('Origen no permitido.', 403);
  if (Number(request.headers.get('content-length') ?? 0) > 20000)
    throw new StoreError('Solicitud demasiado grande.', 413);
  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 20000) {
        await reader.cancel();
        throw new StoreError('Solicitud demasiado grande.', 413);
      }
      chunks.push(value);
    }
  }
  const text = new TextDecoder().decode(Buffer.concat(chunks));
  try {
    return JSON.parse(text);
  } catch {
    throw new StoreError('Solicitud inválida.');
  }
}
export function limit(scope: string, max = 10) {
  rateLimit(scope, max);
}
export async function authorize(adminOnly = false) {
  const role = await getRole();
  if (!role || (adminOnly && role !== 'admin')) throw new StoreError('Acceso no autorizado.', 403);
  return role;
}
