import { NextResponse } from 'next/server';
import { z } from 'zod';
import { trackOrder } from '@/lib/store';
import { body, failure, limit } from '@/lib/http';
export async function POST(r: Request) {
  try {
    limit('tracking', 60);
    const p = z
      .object({ id: z.string().max(40), token: z.string().regex(/^[a-f0-9]{64}$/) })
      .parse(await body(r));
    return NextResponse.json(trackOrder(p.id, p.token), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    return failure(e);
  }
}
