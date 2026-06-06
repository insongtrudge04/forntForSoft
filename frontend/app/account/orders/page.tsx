import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { authApi } from '../../../lib/api';
import type { OrderWithRelations } from '@repo/types';
import { Eye, Clock, ShieldCheck } from 'lucide-react';
import styles from './page.module.css';

export default async function BuyerOrdersPage() {
  const { getToken } = await auth();
  const token = await getToken();
  let orders: OrderWithRelations[] = [];
  if (token) {
    try { orders = await authApi.get<OrderWithRelations[]>('/orders/me', token); } catch {}
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Order History</h1>
        <p>Manage and track your art purchases</p>
      </div>

      <div className={styles.ordersList}>
        {orders.length === 0 ? (
          <div className={styles.empty}>
            <Clock size={40} className={styles.emptyIcon} />
            <h2>No orders found</h2>
            <p>You haven&apos;t purchased any artwork yet.</p>
            <Link href="/browse" className="btn btn-primary">Browse Artworks</Link>
          </div>
        ) : orders.map((order) => (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <div><span className={styles.orderLabel}>Order ID</span><strong className={styles.orderId}>#{order.id.slice(0, 8)}</strong></div>
              <div><span className={styles.orderLabel}>Date Placed</span><span className={styles.orderVal}>{new Date(order.createdAt).toLocaleDateString()}</span></div>
              <div><span className={styles.orderLabel}>Total paid</span><strong className={styles.orderPrice}>${Number(order.subtotal).toLocaleString()}</strong></div>
              <div className={styles.badgeWrap}>
                <span className={`badge ${order.status === 'fulfilled' ? 'badge-green' : order.status === 'paid' ? 'badge-gold' : 'badge-gray'}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
            <div className={styles.orderBody}>
              <div className={styles.artworkRow}>
                <div className={styles.artworkThumb} style={{ background: order.artwork?.images?.[0] ? `url(${order.artwork.images[0].url}) center/cover` : '#1a1a2e' }} />
                <div className={styles.artworkInfo}>
                  <h3>{order.artwork?.title || 'Artwork'}</h3>
                  <p>by {order.artwork?.artist?.displayName || 'Artist'}</p>
                </div>
                <div className={styles.artworkActions}>
                  {order.artwork && <Link href={`/artworks/${order.artwork.slug}`} className="btn btn-outline btn-sm"><Eye size={14} /> View Artwork</Link>}
                </div>
              </div>
            </div>
            <div className={styles.orderFooter}>
              <p className={styles.protection}><ShieldCheck size={14} /> Buyer protection active. Your funds are secured until delivery.</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
