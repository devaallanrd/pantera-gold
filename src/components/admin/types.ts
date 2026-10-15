import type { Product } from '@/lib/catalog';
export type AdminProduct = Product & { cost: number | null };
export type { Order } from '@/lib/order-types';
export type Operations = {
  movements: Record<string, unknown>[];
  events: Record<string, unknown>[];
  audit: Record<string, unknown>[];
  inquiries: Record<string, unknown>[];
  consents: Record<string, unknown>[];
};
