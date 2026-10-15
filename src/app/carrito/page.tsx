import { Cart } from '@/components/cart';
import { getProducts } from '@/lib/store';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Tu carrito' };
export default function Page() {
  return <Cart products={getProducts()} />;
}
