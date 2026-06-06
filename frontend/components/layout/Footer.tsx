import Link from 'next/link';
import { Palette } from 'lucide-react';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <Palette size={20} />
              <span>ArtiSell</span>
            </Link>
            <p>The marketplace for independent artists and serious collectors.</p>
            <div className={styles.socials}>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="mailto:hello@artisell.com" aria-label="Email">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </a>
            </div>
          </div>

          {/* Discover */}
          <div className={styles.col}>
            <h4>Discover</h4>
            <Link href="/browse">Browse All</Link>
            <Link href="/browse?medium=painting">Paintings</Link>
            <Link href="/browse?medium=sculpture">Sculpture</Link>
            <Link href="/browse?medium=photography">Photography</Link>
            <Link href="/browse?medium=print">Prints</Link>
            <Link href="/browse?medium=digital">Digital Art</Link>
          </div>

          {/* Artists */}
          <div className={styles.col}>
            <h4>Artists</h4>
            <Link href="/sign-up">Join as Artist</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/dashboard/new">List Artwork</Link>
          </div>

          {/* Support */}
          <div className={styles.col}>
            <h4>Support</h4>
            <Link href="/help">Help Center</Link>
            <Link href="/shipping">Shipping Info</Link>
            <Link href="/returns">Returns</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/privacy">Privacy Policy</Link>
          </div>
        </div>

        <hr className="divider" />
        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} ArtiSell. All rights reserved.</p>
          <p className={styles.madeWith}>Made for artists, by art lovers.</p>
        </div>
      </div>
    </footer>
  );
}
