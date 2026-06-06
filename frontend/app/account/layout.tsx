'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, UserButton } from '@clerk/nextjs';
import { Heart, ShoppingBag, User as UserIcon, Home, Palette } from 'lucide-react';
import styles from './layout.module.css';

const NAV_ITEMS = [
  { href: '/account/profile', label: 'My Profile', icon: UserIcon },
  { href: '/account/orders', label: 'Order History', icon: ShoppingBag },
  { href: '/account/saved', label: 'Saved Artworks', icon: Heart },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <Link href="/" className={styles.logo}>
            <Palette size={20} />
            <span>ArtiSell</span>
          </Link>
          <div className={styles.dividerLine} />
          <p className={styles.sidebarLabel}>Buyer Account</p>
          <nav className={styles.nav}>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <Link href="/" className={`${styles.navItem} ${styles.navItemSm}`}>
            <Home size={16} />
            <span>Back to Homepage</span>
          </Link>
          <div className={styles.userRow}>
            <UserButton />
            <span className={styles.userName}>{user?.fullName || 'Buyer Account'}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={styles.main}>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
