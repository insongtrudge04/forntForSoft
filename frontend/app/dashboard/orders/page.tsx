import { auth } from '@clerk/nextjs/server';
import { authApi } from '../../../lib/api';
import type { OrderWithRelations } from '@repo/types';
import styles from './page.module.css';

export default async function DashboardOrdersPage() {
  const { getToken } = await auth();
  const token = await getToken();
  let orders: OrderWithRelations[] = [];

  if (token) {
    try {
      orders = await authApi.get<OrderWithRelations[]>('/orders/sales', token);
    } catch {}
  }

  const stats = {
    revenue: orders.filter(o => o.status === 'paid' || o.status === 'fulfilled').reduce((s, o) => s + Number(o.subtotal), 0),
    pending: orders.filter(o => o.status === 'pending').reduce((s, o) => s + Number(o.subtotal), 0),
    total: orders.length,
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Sales & Orders</h1>
        <p>Track your artwork sales and payouts</p>
      </div>
      <div className={styles.summary}>
        <div className={styles.summaryCard}><span>Total Revenue</span><strong>${stats.revenue.toLocaleString()}</strong></div>
        <div className={styles.summaryCard}><span>Pending Payout</span><strong>${stats.pending.toLocaleString()}</strong></div>
        <div className={styles.summaryCard}><span>Total Orders</span><strong>{stats.total}</strong></div>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Order</th><th>Buyer</th><th>Artwork</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {orders.length > 0 ? orders.map(o => (
              <tr key={o.id} className={styles.row}>
                <td className={styles.orderId}>#{o.id.slice(0, 8)}</td>
                <td>{o.buyer?.email || '—'}</td>
                <td>{o.artwork?.title || '—'}</td>
                <td className={styles.amount}>${Number(o.subtotal).toLocaleString()}</td>
                <td><span className={`badge ${o.status === 'fulfilled' ? 'badge-green' : o.status === 'paid' ? 'badge-gold' : o.status === 'pending' ? 'badge-gray' : ''}`}>{o.status}</span></td>
                <td className={styles.muted}>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#71717a' }}>No sales yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
