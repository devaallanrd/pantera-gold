import { getRole, authConfigured } from '@/lib/auth';
import { adminProducts, getOrders, operations } from '@/lib/store';
import { AdminLogin } from '@/components/admin-login';
import { AdminPanel } from '@/components/admin-panel';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Administración', robots: { index: false, follow: false } };
export default async function Page() {
  const role = await getRole();
  if (!role) return <AdminLogin configured={authConfigured()} />;
  const products = role === 'admin' ? adminProducts() : [];
  const ops = operations();
  return (
    <AdminPanel
      role={role}
      products={products}
      orders={getOrders()}
      operations={{
        ...ops,
        audit: role === 'admin' ? ops.audit : [],
        consents: role === 'admin' ? ops.consents : [],
      }}
    />
  );
}
