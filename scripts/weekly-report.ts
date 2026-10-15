import { db, getProducts } from '../src/lib/store';
const from = new Date(Date.now() - 7 * 86400000).toISOString();
const totals = db()
  .prepare('SELECT count(*) count,coalesce(sum(total),0) total FROM orders WHERE created_at>=?')
  .get(from) as { count: number; total: number };
// The local adapter cannot receive real payments. Do not report demo totals as revenue.
console.log(
  JSON.stringify(
    {
      mode: 'demo',
      periodStart: from,
      periodEnd: new Date().toISOString(),
      timezone: 'America/Costa_Rica',
      demoOrders: totals.count,
      demoArticleTotals: totals.total,
      currency: 'CRC',
      confirmedRevenue: 0,
      paidAverageTicket: null,
      contribution: null,
      conversion: null,
      lowStock: getProducts().flatMap((p) =>
        p.variants.filter((v) => v.stock <= 2).map((v) => ({ sku: v.sku, stock: v.stock })),
      ),
      delivery: 'stdout_only_no_email',
    },
    null,
    2,
  ),
);
