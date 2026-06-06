import type { Metadata } from 'next';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { api } from '../../../lib/api';
import type { PaginatedResponse, ArtworkWithRelations } from '@repo/types';
import { SortSelect } from './sort-select';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Browse Artworks',
  description: 'Search and filter thousands of original artworks by medium, price, size, and style.',
};

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

const MEDIUM_OPTIONS = ['painting', 'sculpture', 'photography', 'print', 'digital', 'drawing', 'mixed_media'];

export default async function BrowsePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = parseInt(sp.page || '1');
  const selectedMedium = sp.medium || '';
  const sort = sp.sort || 'newest';
  const minPrice = sp.minPrice || '';
  const maxPrice = sp.maxPrice || '';
  const availability = sp.availability || '';

  let result: PaginatedResponse<ArtworkWithRelations> = { data: [], total: 0, page: 1, limit: 24, totalPages: 0 };

  try {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (selectedMedium) params.set('medium', selectedMedium);
    if (sort !== 'newest') params.set('sort', sort);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (availability) params.set('availability', availability === 'sold' ? 'sold' : 'available');
    params.set('limit', '24');

    result = await api.get<PaginatedResponse<ArtworkWithRelations>>(`/artworks?${params.toString()}`, { next: { revalidate: 60 } });
  } catch {}

  const { data: artworks, total, totalPages } = result;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <h1>Browse Artworks</h1>
          <p>Discover original works from independent artists worldwide</p>
        </div>
      </div>

      <div className="container">
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.filterSection}>
              <h3>Search</h3>
              <form method="GET" action="/browse">
                <div className={styles.searchInput}>
                  <Search size={16} />
                  <input type="text" name="query" placeholder="Search artworks…" className="input" style={{ paddingLeft: '2.25rem' }} />
                </div>
              </form>
            </div>

            <div className={styles.filterSection}>
              <h3>Medium</h3>
              {MEDIUM_OPTIONS.map((m) => {
                const href = selectedMedium === m ? '/browse' : `/browse?medium=${m}`;
                return (
                  <Link key={m} href={href} className={styles.checkLabel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" readOnly checked={selectedMedium === m} />
                    <span>{m.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                  </Link>
                );
              })}
            </div>

            <div className={styles.filterSection}>
              <h3>Price Range</h3>
              <form method="GET" action="/browse" className={styles.priceInputs}>
                {selectedMedium && <input type="hidden" name="medium" value={selectedMedium} />}
                <input type="number" name="minPrice" placeholder="Min" defaultValue={minPrice} className="input" />
                <span>–</span>
                <input type="number" name="maxPrice" placeholder="Max" defaultValue={maxPrice} className="input" />
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Apply</button>
              </form>
            </div>

            <div className={styles.filterSection}>
              <h3>Availability</h3>
              {['available', 'sold'].map((a) => {
                const href = availability === a ? '/browse' : `/browse?availability=${a}`;
                return (
                  <Link key={a} href={href} className={styles.checkLabel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="availability" readOnly checked={availability === a} />
                    <span>{a.charAt(0).toUpperCase() + a.slice(1)}</span>
                  </Link>
                );
              })}
            </div>

            <Link href="/browse" className="btn btn-ghost btn-sm" style={{ width: '100%' }}>Clear All</Link>
          </aside>

          <main className={styles.results}>
            <div className={styles.resultsHeader}>
              <p className={styles.resultCount}>Showing {total} artworks</p>
              <div className={styles.resultsControls}>
                <form method="GET" action="/browse" id="sort-form">
                  {selectedMedium && <input type="hidden" name="medium" value={selectedMedium} />}
                  <SortSelect sort={sort} />
                </form>
              </div>
            </div>

            <div className="artwork-grid">
              {artworks.length > 0 ? artworks.map((a) => (
                <Link key={a.id} href={`/artworks/${a.slug}`} className="card artwork-card">
                  <div style={{ background: a.images?.[0] ? `url(${a.images[0].url}) center/cover` : '#1a1a2e', aspectRatio: '4/5' }} />
                  <div className="artwork-card__info">
                    <div className="artwork-card__title">{a.title}</div>
                    <div className="artwork-card__artist">by {a.artist?.displayName || 'Unknown'}</div>
                    <div className="artwork-card__price">${Number(a.price).toLocaleString()}</div>
                  </div>
                </Link>
              )) : (
                <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#71717a', padding: '2rem' }}>
                  No artworks found
                </p>
              )}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                {page > 1 && (
                  <Link href={`/browse?page=${page - 1}${selectedMedium ? `&medium=${selectedMedium}` : ''}`} className="btn btn-outline btn-sm">
                    ← Previous
                  </Link>
                )}
                <div className={styles.pages}>
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`/browse?page=${p}${selectedMedium ? `&medium=${selectedMedium}` : ''}`}
                      className={`btn btn-ghost btn-sm ${p === page ? styles.activePage : ''}`}
                    >
                      {p}
                    </Link>
                  ))}
                </div>
                {page < totalPages && (
                  <Link href={`/browse?page=${page + 1}${selectedMedium ? `&medium=${selectedMedium}` : ''}`} className="btn btn-outline btn-sm">
                    Next →
                  </Link>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
