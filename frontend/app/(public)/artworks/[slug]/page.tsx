import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart, ShoppingBag, MessageSquare, ChevronLeft, ZoomIn, Share2 } from 'lucide-react';
import { api } from '../../../../lib/api';
import type { ArtworkWithRelations } from '@repo/types';
import styles from './page.module.css';

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  try {
    const artwork = await api.get<ArtworkWithRelations>(`/artworks/${slug}`, { next: { revalidate: 60 } });
    return {
      title: `${artwork.title} — by ${artwork.artist?.displayName || 'Unknown'} — ArtiSell`,
      description: artwork.description?.slice(0, 160) || `Original artwork by ${artwork.artist?.displayName || 'Unknown'}. Available for purchase.`,
      openGraph: {
        title: `${artwork.title} — ArtiSell`,
        description: artwork.description?.slice(0, 200) || 'Original artwork available for purchase.',
        images: artwork.images?.[0]?.url ? [{ url: artwork.images[0].url }] : [],
      },
    };
  } catch {
    return { title: 'Artwork — ArtiSell' };
  }
}

export default async function ArtworkDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  let artwork: ArtworkWithRelations | null = null;
  let related: ArtworkWithRelations[] = [];

  try {
    artwork = await api.get<ArtworkWithRelations>(`/artworks/${slug}`, { next: { revalidate: 60 } });
    related = await api.get<{ data: ArtworkWithRelations[] }>(`/artworks?limit=4`, { next: { revalidate: 60 } }).then(r => r.data).catch(() => []);
  } catch {}

  if (!artwork) {
    return (
      <div className={styles.page}>
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h1>Artwork not found</h1>
          <Link href="/browse" className="btn btn-primary">Browse all artworks</Link>
        </div>
      </div>
    );
  }

  const artistName = artwork.artist?.displayName || 'Unknown';
  const price = Number(artwork.price).toLocaleString();

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.breadcrumb}>
          <Link href="/browse"><ChevronLeft size={14} /> Browse</Link>
          <span>/</span>
          <span>{artwork.title}</span>
        </div>

        <div className={styles.layout}>
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              {artwork.images?.[0] ? (
                <img src={artwork.images[0].url} alt={artwork.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <div className={styles.zoomHint}>
                    <ZoomIn size={16} />
                    <span>No image available</span>
                  </div>
                </div>
              )}
              <button className={styles.shareBtn} aria-label="Share">
                <Share2 size={16} />
              </button>
            </div>
            {(artwork.images?.length ?? 0) > 1 && (
              <div className={styles.thumbnails}>
                {artwork.images?.map((img, i) => (
                  <button key={img.id} className={`${styles.thumb} ${i === 0 ? styles.thumbActive : ''}`} aria-label={`Image ${i + 1}`}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.info}>
            {artwork.artist && (
              <Link href={`/artists/${artwork.artist.slug}`} className={styles.artistCard}>
                <div className={styles.artistAvatar} style={artwork.artist.avatarUrl ? { backgroundImage: `url(${artwork.artist.avatarUrl})`, backgroundSize: 'cover' } : {}} />
                <div>
                  <p className={styles.artistName}>{artistName}</p>
                </div>
                <span className={styles.artistFollow}>View Profile</span>
              </Link>
            )}

            <div className={styles.titleSection}>
              <div className={`badge ${artwork.status === 'live' ? 'badge-green' : 'badge-gray'}`}>
                {artwork.status === 'live' ? 'Available' : artwork.status.charAt(0).toUpperCase() + artwork.status.slice(1)}
              </div>
              <h1 className={`font-display ${styles.title}`}>{artwork.title}</h1>
              <p className={styles.price}>${price} <span className={styles.priceNote}>+ shipping</span></p>
              <p className={styles.edition}>
                <span className="badge badge-gold">{artwork.editionType.charAt(0).toUpperCase() + artwork.editionType.slice(1)}</span>
                {artwork.editionType === 'unique' ? ' — One of a kind' : artwork.editionTotal ? ` — Edition of ${artwork.editionTotal}` : ''}
              </p>
            </div>

            <div className={styles.details}>
              <div className={styles.detailRow}><span>Medium</span><strong>{artwork.medium.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong></div>
              {artwork.width && artwork.height && (
                <div className={styles.detailRow}><span>Dimensions</span><strong>{artwork.width} × {artwork.height}{artwork.depth ? ` × ${artwork.depth}` : ''} {artwork.dimensionUnit}</strong></div>
              )}
              {artwork.year && <div className={styles.detailRow}><span>Year</span><strong>{artwork.year}</strong></div>}
            </div>

            {artwork.description && (
              <p className={styles.description}>{artwork.description}</p>
            )}

            <div className={styles.actions}>
              <button className={`btn btn-primary btn-lg ${styles.buyBtn}`}>
                <ShoppingBag size={18} />
                Buy Now — ${price}
              </button>
              <button className={`btn btn-outline ${styles.wishBtn}`} aria-label="Save to wishlist">
                <Heart size={18} />
              </button>
            </div>
            <button className={`btn btn-ghost ${styles.offerBtn}`}>
              <MessageSquare size={16} />
              Make an offer
            </button>

            <div className={styles.shippingNote}>
              <p>🛡️ Buyer protection guaranteed — secure checkout via Stripe</p>
              <p>📦 Estimated delivery: 5–14 business days</p>
              <p>↩️ Returns accepted within 14 days</p>
            </div>
          </div>
        </div>

        <section className={styles.related}>
          <div className={styles.relatedHeader}>
            <h2>More by {artistName}</h2>
            {artwork.artist && (
              <Link href={`/artists/${artwork.artist.slug}`} className="btn btn-ghost btn-sm">View all →</Link>
            )}
          </div>
          <div className="artwork-grid">
            {related.filter(a => a.id !== artwork.id).slice(0, 4).map((a) => (
              <Link key={a.id} href={`/artworks/${a.slug}`} className="card artwork-card">
                <div style={{ background: a.images?.[0] ? `url(${a.images[0].url}) center/cover` : '#1a1a2e', aspectRatio: '4/5' }} />
                <div className="artwork-card__info">
                  <div className="artwork-card__title">{a.title}</div>
                  <div className="artwork-card__price">${Number(a.price).toLocaleString()}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
