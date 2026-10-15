export type Order = {
  id: string;
  created_at: string;
  email: string;
  customer: { name: string; phone: string; province: string; address: string };
  items: { name: string; sku: string; quantity: number; unitPrice: number }[];
  total: number;
  state: string;
  payment_state: string;
  carrier: string | null;
  tracking_number: string | null;
  notes: string;
};
