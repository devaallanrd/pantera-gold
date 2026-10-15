import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/store';
import { body, failure, limit } from '@/lib/http';
export async function POST(r: Request) {
  try {
    limit('checkout', 100);
    return NextResponse.json(createOrder(await body(r)), { status: 201 });
  } catch (e) {
    return failure(e);
  }
}
