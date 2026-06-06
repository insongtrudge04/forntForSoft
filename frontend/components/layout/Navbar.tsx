'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { Search, Heart, Menu, X, Palette, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import styles from './Navbar.module.css';

export function Navbar() {
  const { isSignedIn, user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const role = (user?.publicMetadata as Record<string, string>)?.role;

  const MEDIUMS = [
    { label: 'Painting', value: 'painting' },
    { label: 'Sculpture', value: 'sculpture' },
    { label: 'Photography', value: 'photography' },
    { label: 'Print', value: 'print' },
    { label: 'Digital', value: 'digital' },
    { label: 'Drawing', value: 'drawing' },
    { label: 'Mixed Media', value: 'mixed_media' },
  ];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const dashboardHref = role === 'artist' ? '/dashboard' : role === 'admin' ? '/admin' : '/account';

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className="container">
        <nav className={styles.nav}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <Palette size={22} />
            <span>ArtiSell</span>
          </Link>

          {/* Desktop Links */}
          <div className={styles.links}>
            <Link href="/browse" className={`${styles.link} ${pathname === '/browse' ? styles.active : ''}`}>Browse</Link>
          </div>

          {/* Search Bar */}
          <div className={styles.searchWrap} ref={searchWrapRef}>
            <form className={styles.searchForm} onSubmit={handleSearch} onFocus={() => setSearchOpen(true)}>
              <Search size={16} />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search artworks…"
                className={styles.searchInput}
              />
            </form>
            {searchOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>Browse by Medium</div>
                {MEDIUMS.map((m) => (
                  <Link key={m.value} href={`/browse?medium=${m.value}`} className={styles.dropdownItem} onClick={() => setSearchOpen(false)}>
                    {m.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button className={`btn btn-ghost btn-sm ${styles.iconBtn} ${styles.searchBtn}`} aria-label="Search" onClick={() => searchRef.current?.focus()}>
              <Search size={18} />
            </button>

            {isSignedIn ? (
              <>
                {role === 'buyer' && (
                  <>
                    <Link href="/become-artist" className="btn btn-ghost btn-sm" aria-label="Become an Artist">
                      <Sparkles size={16} />
                      <span style={{ fontSize: '0.8rem' }}>Sell Art</span>
                    </Link>
                    <Link href="/account/saved" className={`btn btn-ghost btn-sm ${styles.iconBtn}`} aria-label="Wishlist">
                      <Heart size={18} />
                    </Link>
                  </>
                )}
                <Link href={dashboardHref} className="btn btn-outline btn-sm">
                  {role === 'artist' ? 'Dashboard' : role === 'admin' ? 'Admin' : 'Account'}
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="btn btn-ghost btn-sm">Sign In</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn btn-primary btn-sm">Get Started</button>
                </SignUpButton>
              </>
            )}

            {/* Mobile toggle */}
            <button className={styles.menuBtn} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className={styles.mobileMenu}>
            <form className={styles.mobileSearch} onSubmit={(e) => { handleSearch(e); setMobileOpen(false); }}>
              <Search size={16} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search artworks…" className={styles.searchInput} />
            </form>
            <Link href="/browse" onClick={() => setMobileOpen(false)}>Browse</Link>
            {isSignedIn && <Link href={dashboardHref} onClick={() => setMobileOpen(false)}>My Dashboard</Link>}
          </div>
        )}
      </div>
    </header>
  );
}
