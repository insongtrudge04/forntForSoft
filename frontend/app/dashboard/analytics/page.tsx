import { auth } from '@clerk/nextjs/server';
import { authApi } from '../../../lib/api';
import type { ArtworkWithRelations } from '@repo/types';
import { Eye, Heart, DollarSign, TrendingUp } from 'lucide-react';
import styles from './page.module.css';

export default async function AnalyticsPage() {
  const { getToken } = await auth();
  const token = await getToken();
  let artworks: ArtworkWithRelations[] = [];

  if (token) {
    try {
      const r = await authApi.get<{ data: ArtworkWithRelations[] }>('/artworks?limit=50', token);
      artworks = r.data;
    } catch {}
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Analytics</h1>
        <p>Track views, saves, and revenue for your artworks</p>
      </div>
      <div className={styles.grid}>
        {artworks.length > 0 ? artworks.map((a) => (
          <div key={a.id} className={styles.card}>
            <div className={styles.cardImg} style={{ background: a.images?.[0] ? `url(${a.images[0].url}) center/cover` : '#1a1a2e' }} />
            <div className={styles.cardInfo}>
              <p className={styles.cardTitle}>{a.title}</p>
              <div className={styles.metrics}>
                <span className={styles.metric}><Eye size={13} /> {a.viewCount}</span>
                <span className={styles.metric}><Heart size={13} /> {a._count?.savedBy ?? 0}</span>
                <span className={`${styles.metric} ${a.status === 'sold' ? styles.revenue : ''}`}>
                  <DollarSign size={13} /> {a.status === 'sold' ? `$${Number(a.price).toLocaleString()}` : '—'}
                </span>
              </div>
            </div>
          </div>
        )) : (
          <p style={{ gridColumn: '1/-1', color: '#71717a', textAlign: 'center', padding: '2rem' }}>No data yet</p>
        )}
      </div>
      <div className={styles.chartPlaceholder}>
        <TrendingUp size={32} color="var(--color-text-muted)" />
        <p>Detailed charting coming soon</p>
        <span>Views over time · Saves per artwork · Revenue chart</span>
      </div>
    </div>
  );
}
