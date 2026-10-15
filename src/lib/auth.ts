import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
export type Role = 'admin' | 'operator';
function equal(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export function verifyPassword(password: string, hash: string) {
  try {
    const [salt, key] = hash.split(':');
    if (!salt || !key) return false;
    return equal(scryptSync(password, salt, 64).toString('hex'), key);
  } catch {
    return false;
  }
}
export function authConfigured() {
  return !!process.env.ADMIN_PASSWORD_HASH && (process.env.SESSION_SECRET?.length ?? 0) >= 32;
}
export function signSession(role: Role) {
  if (!authConfigured()) throw Error('Administración no configurada');
  const body = Buffer.from(
    JSON.stringify({
      role,
      exp: Date.now() + 8 * 3600_000,
      nonce: randomBytes(16).toString('hex'),
    }),
  ).toString('base64url');
  return (
    body + '.' + createHmac('sha256', process.env.SESSION_SECRET!).update(body).digest('base64url')
  );
}
export function readSession(token: string): Role | null {
  if (!authConfigured()) return null;
  try {
    const [body, sig] = token.split('.');
    if (
      !sig ||
      !equal(
        sig,
        createHmac('sha256', process.env.SESSION_SECRET!).update(body).digest('base64url'),
      )
    )
      return null;
    const p = JSON.parse(Buffer.from(body, 'base64url').toString());
    return p.exp > Date.now() && ['admin', 'operator'].includes(p.role) ? p.role : null;
  } catch {
    return null;
  }
}
export async function getRole() {
  return readSession((await cookies()).get('pg_session')?.value ?? '');
}
