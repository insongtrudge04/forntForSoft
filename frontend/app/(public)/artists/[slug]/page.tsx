import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Globe } from 'lucide-react';
import { api } from '../../../../lib/api';
import type { ArtworkWithRelations, ArtistProfile, PaginatedResponse } from '@repo/types';
import styles from './page.module.css';

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  try {
    const artist = await api.get<ArtistProfile & { user?: { email: string } }>(`/artists/${slug}`, { next: { revalidate: 60 } });
    return {
      title: `${artist.displayName} — Artist Profile`,
      description: artist.bio?.slice(0, 160) || `${artist.displayName} on ArtiSell`,
      openGraph: { title: `${artist.displayName} — ArtiSell`, type: 'profile' },
    };
  } catch {
    return { title: 'Artist — ArtiSell' };
  }
}

interface ArtistResponse extends ArtistProfile {
  artworks?: ArtworkWithRelations[];
}

export default async function ArtistProfilePage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  let artist: ArtistResponse | null = null;
  let artworks: ArtworkWithRelations[] = [];

  try {
    artist = await api.get<ArtistResponse>(`/artists/${slug}`, { next: { revalidate: 60 } });
    const result = await api.get<PaginatedResponse<ArtworkWithRelations>>(`/artworks?artistId=${artist?.userId}&limit=24&sort=newest`, { next: { revalidate: 60 } });
    artworks = result.data;
  } catch {}

  if (!artist) {
    return (
      <div className={styles.page}>
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h1>Artist not found</h1>
          <Link href="/browse" className="btn btn-primary">Browse all artworks</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <div className={styles.profile}>
            <div className={styles.avatar} style={artist.avatarUrl ? { backgroundImage: `url(${artist.avatarUrl})`, backgroundSize: 'cover' } : {}} />
            <div className={styles.profileInfo}>
              <h1 className={`font-display ${styles.name}`}>{artist.displayName}</h1>
              <div className={styles.meta}>
                <span>{artworks.length} works</span>
              </div>
              {artist.bio && <p className={styles.bio}>{artist.bio}</p>}
              <div className={styles.profileActions}>
                <button className="btn btn-primary">Follow</button>
                {artist.instagramHandle && (
                  <a href={`https://instagram.com/${artist.instagramHandle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                    {artist.instagramHandle}
                  </a>
                )}
                {artist.website && (
                  <a href={artist.website} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                    <Globe size={15} /> Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className={styles.gridHeader}>
            <h2>Artworks <span className={styles.count}>{artworks.length}</span></h2>
          </div>
          <div className="artwork-grid">
            {artworks.length > 0 ? artworks.map((a) => (
              <Link key={a.id} href={`/artworks/${a.slug}`} className="card artwork-card">
                <div style={{ background: a.images?.[0] ? `url(${a.images[0].url}) center/cover` : '#1a1a2e', aspectRatio: '4/5' }} />
                <div className="artwork-card__info">
                  <div className="artwork-card__title">{a.title}</div>
                  <div className="artwork-card__price">${Number(a.price).toLocaleString()}</div>
                </div>
              </Link>
            )) : (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#71717a', padding: '2rem' }}>
                No artworks yet
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
