'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  LayoutDashboard, Image as ImageIcon, ShoppingBag, BarChart2,
  Settings, Plus, Palette, ChevronRight, Bell
} from 'lucide-react';
import styles from './layout.module.css';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/listings', label: 'Listings', icon: ImageIcon },
  { href: '/dashboard/new', label: 'New Artwork', icon: Plus, highlight: true },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
          <p className={styles.sidebarLabel}>Artist Dashboard</p>
          <nav className={styles.nav}>
            {NAV_ITEMS.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${isActive ? styles.active : ''} ${item.highlight ? styles.highlight : ''}`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight size={14} className={styles.activeArrow} />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <Link href="/" className={`${styles.navItem} ${styles.navItemSm}`}>
            <span>← Back to site</span>
          </Link>
          <div className={styles.userRow}>
            <UserButton />
            <span className={styles.userName}>My Account</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.breadcrumb}>
            <span>Dashboard</span>
            {pathname !== '/dashboard' && (
              <>
                <ChevronRight size={14} />
                <span>{NAV_ITEMS.find(i => pathname.startsWith(i.href) && i.href !== '/dashboard')?.label}</span>
              </>
            )}
          </div>
          <div className={styles.topbarActions}>
            <button className="btn btn-ghost btn-sm" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <Link href="/dashboard/new" className="btn btn-primary btn-sm">
              <Plus size={16} /> New Artwork
            </Link>
          </div>
        </header>

        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
