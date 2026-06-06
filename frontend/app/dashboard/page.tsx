import Link from 'next/link';
import { TrendingUp, Eye, ShoppingBag, DollarSign, Plus, ArrowRight } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { authApi } from '../../lib/api';
import type { ArtworkWithRelations, OrderWithRelations, ArtistProfile } from '@repo/types';
import styles from './page.module.css';

interface ArtistMeResponse extends ArtistProfile {
  user: { email: string };
}

export default async function DashboardPage() {
  const { getToken } = await auth();
  const token = await getToken();

  let artworks: ArtworkWithRelations[] = [];
  let orders: OrderWithRelations[] = [];
  let profile: ArtistMeResponse | null = null;
  let stats = { views: 0, listings: 0, orders: 0, revenue: 0 };

  if (token) {
    try {
      [artworks, orders] = await Promise.all([
        authApi.get<{ data: ArtworkWithRelations[] }>('/artworks?limit=10', token).then(r => r.data).catch(() => []),
        authApi.get<OrderWithRelations[]>('/orders/me', token).catch(() => []),
      ]);

      stats = {
        views: artworks.reduce((s, a) => s + a.viewCount, 0),
        listings: artworks.filter(a => a.status !== 'sold').length,
        orders: orders.length,
        revenue: orders.filter(o => o.status === 'paid' || o.status === 'fulfilled').reduce((s, o) => s + Number(o.subtotal), 0),
      };

      profile = await authApi.get<ArtistMeResponse>('/artists/me', token).catch(() => null);
    } catch {}
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Dashboard</h1>
          <p>Here&apos;s what&apos;s happening with your art today.</p>
        </div>
        <Link href="/dashboard/new" className="btn btn-primary">
          <Plus size={16} /> List New Artwork
        </Link>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}><span className={styles.statLabel}>Total Views</span><div className={styles.statIcon}><Eye size={18} /></div></div>
          <div className={styles.statValue}>{stats.views.toLocaleString()}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}><span className={styles.statLabel}>Active Listings</span><div className={styles.statIcon}><TrendingUp size={18} /></div></div>
          <div className={styles.statValue}>{stats.listings}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}><span className={styles.statLabel}>Total Orders</span><div className={styles.statIcon}><ShoppingBag size={18} /></div></div>
          <div className={styles.statValue}>{stats.orders}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}><span className={styles.statLabel}>Revenue</span><div className={styles.statIcon}><DollarSign size={18} /></div></div>
          <div className={styles.statValue}>${stats.revenue.toLocaleString()}</div>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Recent Listings</h2>
            <Link href="/dashboard/listings" className="btn btn-ghost btn-sm">View all <ArrowRight size={14} /></Link>
          </div>
          <div className={styles.listingsList}>
            {artworks.slice(0, 5).map((a) => (
              <div key={a.id} className={styles.listingRow}>
                <div className={styles.listingThumb} style={{ background: a.images?.[0] ? `url(${a.images[0].url}) center/cover` : '#1a1a2e' }} />
                <div className={styles.listingInfo}>
                  <p className={styles.listingTitle}>{a.title}</p>
                  <p className={styles.listingMeta}>{a.medium.replace('_', ' ')} · ${Number(a.price).toLocaleString()}</p>
                </div>
                <span className={`badge ${a.status === 'live' ? 'badge-green' : a.status === 'draft' ? 'badge-gray' : a.status === 'pending_review' ? 'badge-gold' : ''}`}>
                  {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                </span>
              </div>
            ))}
            {artworks.length === 0 && <p style={{ padding: '1rem', color: '#71717a' }}>No listings yet</p>}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Recent Sales</h2>
            <Link href="/dashboard/orders" className="btn btn-ghost btn-sm">View all <ArrowRight size={14} /></Link>
          </div>
          <div className={styles.listingsList}>
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className={styles.listingRow}>
                <div className={styles.listingInfo}>
                  <p className={styles.listingTitle}>Order #{o.id.slice(0, 8)}</p>
                  <p className={styles.listingMeta}>{o.artwork?.title || 'Artwork'} · ${Number(o.subtotal).toLocaleString()}</p>
                </div>
                <span className={`badge ${o.status === 'paid' || o.status === 'fulfilled' ? 'badge-green' : 'badge-gray'}`}>
                  {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                </span>
              </div>
            ))}
            {orders.length === 0 && <p style={{ padding: '1rem', color: '#71717a' }}>No sales yet</p>}
          </div>
        </div>
      </div>

      <div className={styles.quickActions}>
        <h2>Quick Actions</h2>
        <div className={styles.actionGrid}>
          <Link href="/dashboard/new" className={styles.actionCard}><Plus size={24} /><span>List Artwork</span></Link>
          <Link href="/dashboard/settings" className={styles.actionCard}><DollarSign size={24} /><span>Connect Stripe</span></Link>
          <Link href="/dashboard/analytics" className={styles.actionCard}><TrendingUp size={24} /><span>View Analytics</span></Link>
          {profile?.slug && (
            <Link href={`/artists/${profile.slug}`} className={styles.actionCard}><Eye size={24} /><span>Preview Profile</span></Link>
          )}
        </div>
      </div>
    </div>
  );
}
