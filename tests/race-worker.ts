import { createOrder } from '../src/lib/store';
import { randomUUID } from 'node:crypto';
try {
  createOrder({
    items: [{ variantId: 'v5', quantity: 1 }],
    name: 'Cliente de prueba',
    email: 'demo@example.test',
    phone: '88888888',
    province: 'San José',
    address: 'Dirección ficticia para prueba',
    consent: true,
    idempotencyKey: randomUUID(),
  });
  process.exit(0);
} catch {
  process.exit(2);
}
