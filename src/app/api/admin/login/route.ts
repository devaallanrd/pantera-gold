import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authConfigured, signSession, verifyPassword } from '@/lib/auth';
import { StoreError } from '@/lib/schemas';
import { body, failure, limit } from '@/lib/http';
export async function POST(r: Request) {
  try {
    limit('admin-login', 8);
    if (!authConfigured())
      throw new StoreError(
        'Configura ADMIN_PASSWORD_HASH y SESSION_SECRET en el servidor. Consulta la documentación.',
        503,
      );
    const p = z
      .object({ password: z.string().max(200), role: z.enum(['admin', 'operator']) })
      .parse(await body(r));
    const hash =
      p.role === 'admin' ? process.env.ADMIN_PASSWORD_HASH : process.env.OPERATOR_PASSWORD_HASH;
    if (!hash || !verifyPassword(p.password, hash))
      throw new StoreError('Credenciales incorrectas.', 401);
    const res = NextResponse.json({ ok: true });
    res.cookies.set('pg_session', signSession(p.role), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 3600,
      path: '/',
    });
    return res;
  } catch (e) {
    return failure(e);
  }
}
