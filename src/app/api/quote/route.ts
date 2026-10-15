import { NextResponse } from 'next/server';
import { z } from 'zod';
import { quote } from '@/lib/store';
import { cartItemSchema } from '@/lib/schemas';
import { body, failure, limit } from '@/lib/http';
export async function POST(r: Request) {
  try {
    limit('quote', 600);
    const p = z
      .object({
        items: z.array(cartItemSchema).min(1).max(40),
        promo: z.string().max(40).default(''),
      })
      .parse(await body(r));
    return NextResponse.json(quote(p.items, p.promo));
  } catch (e) {
    return failure(e);
  }
}
