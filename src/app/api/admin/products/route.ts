import { NextResponse } from 'next/server';
import { saveProduct } from '@/lib/store';
import { authorize, body, failure } from '@/lib/http';
export async function POST(r: Request) {
  try {
    const role = await authorize(true);
    const id = saveProduct(await body(r), role);
    return NextResponse.json({ id });
  } catch (e) {
    return failure(e);
  }
}
