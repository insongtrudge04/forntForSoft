import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, Palette, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import type { PaginatedResponse, ArtworkWithRelations } from '@repo/types';
import { HomeSortSelect } from './home-sort-select';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'ArtiSell — Buy & Sell Original Art',
  description: 'Discover and collect original artwork from independent artists worldwide. Paintings, sculptures, photography, prints and more.',
};

const MEDIUM_OPTIONS = ['painting', 'sculpture', 'photography', 'print', 'digital', 'drawing', 'mixed_media'] as const;

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = parseInt(sp.page || '1');
  const selectedMedium = sp.medium || '';
  const sort = sp.sort || 'newest';
  const query = sp.query || '';

  let result: PaginatedResponse<ArtworkWithRelations> = { data: [], total: 0, page: 1, limit: 24, totalPages: 0 };
  let artistCount = 0;

  try {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (selectedMedium) params.set('medium', selectedMedium);
    if (sort !== 'newest') params.set('sort', sort);
    if (query) params.set('query', query);
    params.set('limit', '24');

    result = await api.get<PaginatedResponse<ArtworkWithRelations>>(`/artworks?${params.toString()}`, { next: { revalidate: 60 } });
    artistCount = await api.get<number>('/artists/count', { next: { revalidate: 60 } });
  } catch {}

  const { data: artworks, total, totalPages } = result;

  return (
    <div className={styles.page}>
      {/* ── Hero Strip ─────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroInner}>
            <div>
              <h1 className={styles.heroTitle}>Discover original art from independent artists</h1>
              <p className={styles.heroSub}>Paintings, sculptures, photography, prints & more</p>
            </div>
            <div className={styles.heroStats}>
              <span><strong>{total.toLocaleString()}</strong> artworks</span>
              <span className={styles.statDiv}>|</span>
              <span><strong>{artistCount.toLocaleString()}</strong> artists</span>
              <span className={styles.statDiv}>|</span>
              <Link href="/become-artist" className={styles.sellLink}>
                <Sparkles size={14} />
                Sell your art
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Filters & Grid ─────────────────────────────────────────────────── */}
      <section className={styles.shop}>
        <div className="container">
          {/* Top bar: filter tabs + search + sort */}
          <div className={styles.topBar}>
            <div className={styles.mediumTabs}>
              <Link href="/" className={`${styles.mediumTab} ${!selectedMedium ? styles.activeTab : ''}`}>All</Link>
              {MEDIUM_OPTIONS.map((m) => (
                <Link
                  key={m}
                  href={`/?medium=${m}${sort !== 'newest' ? `&sort=${sort}` : ''}`}
                  className={`${styles.mediumTab} ${selectedMedium === m ? styles.activeTab : ''}`}
                >
                  {m.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </Link>
              ))}
            </div>

            <div className={styles.topControls}>
              <form method="GET" action="/" className={styles.searchForm}>
                <Search size={16} />
                <input type="text" name="query" defaultValue={query} placeholder="Search…" className={styles.searchInput} />
              </form>
              <form method="GET" action="/" id="sort-form">
                {selectedMedium && <input type="hidden" name="medium" value={selectedMedium} />}
                <HomeSortSelect sort={sort} />
              </form>
            </div>
          </div>

          {/* Results info */}
          <p className={styles.resultCount}>
            {total > 0 ? `Showing ${artworks.length} of ${total} artworks` : 'No artworks found'}
          </p>

          {/* Artwork Grid */}
          <div className="artwork-grid">
            {artworks.length > 0 ? artworks.map((a) => (
              <Link key={a.id} href={`/artworks/${a.slug}`} className="card artwork-card">
                <div style={{ background: a.images?.[0] ? `url(${a.images[0].url}) center/cover` : 'var(--color-surface-2)', aspectRatio: '4/5' }}>
                  {!a.images?.[0] && (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Palette size={28} color="var(--color-text-muted)" />
                    </div>
                  )}
                </div>
                <div className="artwork-card__info">
                  <div className="artwork-card__artist">by {a.artist?.displayName || 'Unknown'}</div>
                  <div className="artwork-card__title">{a.title}</div>
                  <div className="artwork-card__price">${Number(a.price).toLocaleString()}</div>
                </div>
              </Link>
            )) : (
              <p className={styles.empty}>
                No artworks match your criteria.{' '}
                <Link href="/">Clear filters</Link>
              </p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              {page > 1 && (
                <Link
                  href={`/?page=${page - 1}${selectedMedium ? `&medium=${selectedMedium}` : ''}${sort !== 'newest' ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}`}
                  className="btn btn-outline btn-sm"
                >
                  ← Previous
                </Link>
              )}
              <div className={styles.pages}>
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/?page=${p}${selectedMedium ? `&medium=${selectedMedium}` : ''}${sort !== 'newest' ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}`}
                    className={`btn btn-ghost btn-sm ${p === page ? styles.activePage : ''}`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
              {page < totalPages && (
                <Link
                  href={`/?page=${page + 1}${selectedMedium ? `&medium=${selectedMedium}` : ''}${sort !== 'newest' ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}`}
                  className="btn btn-outline btn-sm"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Artist CTA ──────────────────────────────────────────────────────── */}
      <section className={`section ${styles.artistCta}`}>
        <div className="container">
          <div className={styles.ctaCard}>
            <div className={styles.ctaGlow} />
            <div className={styles.ctaContent}>
              <div className="badge badge-gold">For Artists</div>
              <h2 className="font-display">Start selling your art today</h2>
              <p>Join {artistCount.toLocaleString()}+ artists already earning on ArtiSell. Set your own prices, reach a global audience, and get paid directly.</p>
              <div className={styles.ctaFeatures}>
                <span className={styles.ctaFeature}>✓ Zero listing fees</span>
                <span className={styles.ctaFeature}>✓ 90% artist commission</span>
                <span className={styles.ctaFeature}>✓ Fast, direct payouts</span>
              </div>
              <Link href="/become-artist" className="btn btn-primary btn-lg">
                Create Artist Account <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
