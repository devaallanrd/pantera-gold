import { NextResponse } from 'next/server';
export async function POST() {
  return NextResponse.json(
    { error: 'Pasarela no configurada. No se aceptan eventos de pago.' },
    { status: 503 },
  );
}
