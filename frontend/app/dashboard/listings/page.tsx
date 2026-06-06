import Link from 'next/link';
import { Edit, Trash2, Eye, Plus } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { authApi } from '../../../lib/api';
import type { PaginatedResponse, ArtworkWithRelations } from '@repo/types';
import styles from './page.module.css';

export default async function ListingsPage() {
  const { getToken } = await auth();
  const token = await getToken();
  let artworks: ArtworkWithRelations[] = [];

  if (token) {
    try {
      const result = await authApi.get<PaginatedResponse<ArtworkWithRelations>>('/artworks?limit=50', token);
      artworks = result.data;
    } catch {}
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>My Listings</h1>
          <p>Manage your published artworks</p>
        </div>
        <Link href="/dashboard/new" className="btn btn-primary">
          <Plus size={16} /> New Artwork
        </Link>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Artwork</th>
              <th>Price</th>
              <th>Status</th>
              <th>Views</th>
              <th>Saves</th>
              <th>Listed</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {artworks.length > 0 ? artworks.map((a) => (
              <tr key={a.id} className={styles.row}>
                <td>
                  <div className={styles.artworkCell}>
                    <div className={styles.thumb} style={{ background: a.images?.[0] ? `url(${a.images[0].url}) center/cover` : '#1a1a2e' }} />
                    <div>
                      <p className={styles.artworkTitle}>{a.title}</p>
                      <p className={styles.artworkMeta}>{a.medium.replace('_', ' ')} · {a.width && a.height ? `${a.width}×${a.height}cm` : ''}</p>
                    </div>
                  </div>
                </td>
                <td className={styles.price}>${Number(a.price).toLocaleString()}</td>
                <td>
                  <span className={`badge ${
                    a.status === 'live' ? 'badge-green' :
                    a.status === 'pending_review' ? 'badge-gold' :
                    a.status === 'sold' ? '' :
                    'badge-gray'
                  }`}>
                    {a.status.replace('_', ' ')}
                  </span>
                </td>
                <td className={styles.muted}>{a.viewCount}</td>
                <td className={styles.muted}>{a._count?.savedBy ?? 0}</td>
                <td className={styles.muted}>{new Date(a.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actions}>
                    <Link href={`/artworks/${a.slug}`} className="btn btn-ghost btn-sm" aria-label="View"><Eye size={15} /></Link>
                    <Link href={`/dashboard/listings/${a.id}/edit`} className="btn btn-ghost btn-sm" aria-label="Edit"><Edit size={15} /></Link>
                    <button className="btn btn-ghost btn-sm" aria-label="Delete"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#71717a' }}>
                  No listings yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
