import { Checkout } from '@/components/checkout';
import { getProducts } from '@/lib/store';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Checkout de demostración' };
export default function Page() {
  return <Checkout products={getProducts()} />;
}
