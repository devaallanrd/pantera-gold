import { NextResponse } from 'next/server';
import { body, failure } from '@/lib/http';
export async function POST(r: Request) {
  try {
    await body(r);
    const res = NextResponse.json({ ok: true });
    res.cookies.set('pg_session', '', { maxAge: 0, path: '/' });
    return res;
  } catch (e) {
    return failure(e);
  }
}
