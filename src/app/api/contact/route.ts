import { NextResponse } from 'next/server';
import { z } from 'zod';
import { contact } from '@/lib/store';
import { body, failure, limit } from '@/lib/http';
export async function POST(r: Request) {
  try {
    limit('contact', 30);
    const p = z
      .object({
        name: z.string().min(2).max(100),
        email: z.email().max(160),
        message: z.string().min(10).max(2000),
        consent: z.literal(true),
      })
      .parse(await body(r));
    contact(p.name, p.email, p.message);
    return NextResponse.json({
      message: 'Consulta guardada en la demostración. Aún no se envían notificaciones al comercio.',
    });
  } catch (e) {
    return failure(e);
  }
}
