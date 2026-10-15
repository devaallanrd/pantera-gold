import { NextResponse } from 'next/server';
import { z } from 'zod';
import { subscribe } from '@/lib/store';
import { body, failure, limit } from '@/lib/http';
export async function POST(r: Request) {
  try {
    limit('newsletter', 30);
    const p = z
      .object({ email: z.email().max(160), consent: z.literal(true) })
      .parse(await body(r));
    subscribe(p.email);
    return NextResponse.json({
      message:
        'Consentimiento guardado en la demostración. No se enviarán correos hasta activar la integración.',
    });
  } catch (e) {
    return failure(e);
  }
}
