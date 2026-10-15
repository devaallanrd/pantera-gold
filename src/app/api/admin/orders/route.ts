import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateOrder } from '@/lib/store';
import { authorize, body, failure } from '@/lib/http';
export async function POST(r: Request) {
  try {
    const role = await authorize();
    const p = z
      .object({
        id: z.string().max(40),
        state: z.enum(['received', 'preparing', 'shipped', 'delivered', 'cancelled']),
        carrier: z.string().max(100),
        tracking: z.string().max(100),
        notes: z.string().max(1000),
      })
      .parse(await body(r));
    updateOrder(p.id, p.state, p.carrier, p.tracking, p.notes, role);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
