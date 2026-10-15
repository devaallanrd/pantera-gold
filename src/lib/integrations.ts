/** Server-only contracts. These adapters intentionally cannot charge or deliver messages. */
export type PaymentEvent = {
  eventId: string;
  paymentId: string;
  orderId: string;
  amountMinor: number;
  currency: 'CRC';
  state: 'confirmed' | 'failed' | 'refunded';
};
export interface PaymentGateway {
  createHostedCheckout(orderId: string): Promise<{ url: string }>;
  verifyWebhook(rawBody: Uint8Array, headers: Headers): Promise<PaymentEvent>;
}
export interface TransactionalMessages {
  send(
    template: 'order.received' | 'order.shipped' | 'order.delivered',
    orderId: string,
    deduplicationKey: string,
  ): Promise<{ providerId: string }>;
}
export const integrationStatus = {
  payments: 'not_configured',
  email: 'not_configured',
  whatsappAutomation: 'not_configured',
  analytics: 'not_configured',
  supabaseAdapter: 'pending_staging_validation',
} as const;
export function contribution(input: {
  netSale: number;
  productCost: number | null;
  paymentFee: number | null;
  packaging: number | null;
  shippingAbsorbed: number | null;
  advertising: number | null;
  other: number | null;
}): number | null {
  const costs = [
    input.productCost,
    input.paymentFee,
    input.packaging,
    input.shippingAbsorbed,
    input.advertising,
    input.other,
  ];
  if (costs.some((c) => c === null)) return null;
  return input.netSale - (costs as number[]).reduce((a, b) => a + b, 0);
}
export type AnalyticsEvent = {
  event: 'view_item' | 'add_to_cart' | 'begin_checkout' | 'purchase';
  itemIds: string[];
  currency: 'CRC';
  value?: number;
  orderId?: string;
};
// Wire a consent-aware provider here. A purchase event must originate from verified payment processing.
export async function recordAnalytics(_event: AnalyticsEvent, _consent: boolean) {
  return { status: 'not_configured' as const };
}
