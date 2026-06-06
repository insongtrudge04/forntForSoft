import { auth } from '@clerk/nextjs/server';
import { authApi } from '../../lib/api';
import type { ArtworkWithRelations, User } from '@repo/types';
import { ShieldAlert, CheckCircle, XCircle, Users, BarChart3, Settings } from 'lucide-react';
import styles from './page.module.css';

interface AdminStats {
  users: number;
  artworks: number;
  totalRevenue: number;
}

export default async function AdminPage() {
  const { getToken } = await auth();
  const token = await getToken();
  let stats: AdminStats = { users: 0, artworks: 0, totalRevenue: 0 };
  let pendingArtworks: ArtworkWithRelations[] = [];

  if (token) {
    try {
      [stats, pendingArtworks] = await Promise.all([
        authApi.get<AdminStats>('/admin/stats', token).catch(() => stats),
        authApi.get<ArtworkWithRelations[]>('/admin/artworks/pending', token).catch(() => []),
      ]);
    } catch {}
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Admin Control Panel</h1>
        <p>Manage listings, curate featured artworks, and set platform configurations.</p>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statInfo}><span>Active Listings</span><strong>{stats.artworks}</strong></div>
          <CheckCircle size={28} className={styles.greenIcon} />
        </div>
        <div className={styles.statCard}>
          <div className={styles.statInfo}><span>Pending Moderation</span><strong>{pendingArtworks.length}</strong></div>
          <ShieldAlert size={28} className={styles.goldIcon} />
        </div>
        <div className={styles.statCard}>
          <div className={styles.statInfo}><span>Registered Users</span><strong>{stats.users}</strong></div>
          <Users size={28} className={styles.blueIcon} />
        </div>
        <div className={styles.statCard}>
          <div className={styles.statInfo}><span>Platform Revenue</span><strong>${stats.totalRevenue.toLocaleString()}</strong></div>
          <BarChart3 size={28} className={styles.goldIcon} />
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Artwork Moderation Queue</h2>
            <span className="badge badge-gold">{pendingArtworks.length} Pending</span>
          </div>
          <div className={styles.queue}>
            {pendingArtworks.length > 0 ? pendingArtworks.map((item) => (
              <div key={item.id} className={styles.queueItem}>
                <div className={styles.itemThumb} style={{ background: item.images?.[0] ? `url(${item.images[0].url}) center/cover` : '#1a1a2e' }} />
                <div className={styles.itemInfo}>
                  <h3>{item.title}</h3>
                  <p>by <strong>{item.artist?.displayName || 'Artist'}</strong> · {item.medium.replace('_', ' ')} · ${Number(item.price).toLocaleString()}</p>
                  <span className={styles.submitted}>Submitted {new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <div className={styles.itemActions}>
                  <button className="btn btn-primary btn-sm">Approve</button>
                  <button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}>Reject</button>
                </div>
              </div>
            )) : (
              <p style={{ padding: '1rem', color: '#71717a' }}>No pending artworks</p>
            )}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Platform Config</h2>
            <Settings size={18} />
          </div>
          <div className={styles.configForm}>
            <div className="field">
              <label className="label">Default Commission Rate (%)</label>
              <input className="input" type="number" defaultValue={10} />
            </div>
            <div className="field">
              <label className="label">Featured Artwork ID (Homepage)</label>
              <input className="input" defaultValue="" />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }}>Save Platform Config</button>
          </div>
        </div>
      </div>
    </div>
  );
}
