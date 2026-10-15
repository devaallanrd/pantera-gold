import { z } from 'zod';
export const cartItemSchema = z.object({
  variantId: z.string().min(1).max(80),
  quantity: z.number().int().min(1).max(20),
});
export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(40),
  name: z.string().trim().min(2).max(100),
  email: z.email().max(160),
  phone: z.string().regex(/^\+?[\d\s-]{8,20}$/),
  province: z.enum([
    'San José',
    'Alajuela',
    'Cartago',
    'Heredia',
    'Guanacaste',
    'Puntarenas',
    'Limón',
  ]),
  address: z.string().trim().min(12).max(500),
  consent: z.literal(true),
  idempotencyKey: z.uuid(),
  promo: z.string().max(40).default(''),
});
export const productSchema = z.object({
  id: z.string().max(80).optional(),
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(100),
  category: z.enum(['joyeria', 'relojes', 'colonias']),
  type: z.string().min(2).max(60),
  description: z.string().min(10).max(2000),
  price: z.number().int().min(1).max(10000000),
  cost: z.number().int().min(0).max(10000000).nullable(),
  image: z.enum(['/images/jewelry.jpg', '/images/watch.jpg', '/images/fragrance.jpg']),
  stock: z.number().int().min(0).max(100000),
  featured: z.boolean(),
  active: z.boolean(),
  variantName: z.string().min(1).max(80),
  sku: z.string().min(1).max(80),
});
export class StoreError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
