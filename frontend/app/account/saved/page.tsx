import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { authApi } from '../../../lib/api';
import type { SavedWorkWithRelations } from '@repo/types';
import { Heart, HeartOff, Eye, ShoppingBag } from 'lucide-react';
import styles from './page.module.css';

export default async function BuyerSavedPage() {
  const { getToken } = await auth();
  const token = await getToken();
  let saved: SavedWorkWithRelations[] = [];
  if (token) {
    try { saved = await authApi.get<SavedWorkWithRelations[]>('/orders/saved', token); } catch {}
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Saved Artworks</h1>
        <p>Curate your personal collection wishlist</p>
      </div>

      {saved.length === 0 ? (
        <div className={styles.empty}>
          <Heart size={40} className={styles.emptyIcon} />
          <h2>Your saved list is empty</h2>
          <p>Tap the heart icon on any artwork to save it here.</p>
          <Link href="/browse" className="btn btn-primary">Discover Artwork</Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {saved.map((item) => {
            const a = item.artwork;
            return (
              <div key={item.id} className={`card ${styles.artCard}`}>
                <div className={styles.thumbWrap}>
                  <div className={styles.thumb} style={{ background: a?.images?.[0] ? `url(${a.images[0].url}) center/cover` : '#1a1a2e' }} />
                </div>
                <div className={styles.cardInfo}>
                  <div className={styles.titleRow}>
                    <h3>{a?.title || 'Artwork'}</h3>
                    <span className={`badge ${a?.status === 'live' ? 'badge-green' : 'badge-red'}`}>
                      {a?.status === 'live' ? 'Available' : 'Sold'}
                    </span>
                  </div>
                  <p className={styles.artist}>by {a?.artist?.displayName || 'Artist'}</p>
                  <div className={styles.bottomRow}>
                    <strong className={styles.price}>${a ? Number(a.price).toLocaleString() : '—'}</strong>
                    <div className={styles.actions}>
                      {a && <Link href={`/artworks/${a.slug}`} className="btn btn-outline btn-sm" aria-label="View"><Eye size={14} /></Link>}
                      {a?.status === 'live' && (
                        <button className="btn btn-primary btn-sm" aria-label="Add to cart"><ShoppingBag size={14} /></button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
