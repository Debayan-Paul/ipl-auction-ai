'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { useAuthStore, useThemeStore, useSidebarStore } from '@/lib/store';
import { getInitials, cn } from '@/lib/utils';
import type { UserRole } from '@/lib/types';
import styles from './dashboard.module.css';

interface NavItem {
  icon: string;
  label: string;
  href: string;
  minRole: UserRole;
  badge?: string;
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Analytics',
    items: [
      { icon: '📊', label: 'Player Stats', href: '/stats', minRole: 'free' },
      { icon: '⚔️', label: 'Compare Players', href: '/compare', minRole: 'free' },
    ],
  },
  {
    label: 'Pro Features',
    items: [
      { icon: '🤖', label: 'AI Predictions', href: '/predictions', minRole: 'pro', badge: 'PRO' },
      { icon: '🏟️', label: 'Team vs Team', href: '/team-compare', minRole: 'pro', badge: 'PRO' },
      { icon: '🎲', label: 'Digital Twin', href: '/simulations', minRole: 'pro', badge: 'PRO' },
      { icon: '📺', label: 'Live Auction', href: '/live-auction', minRole: 'pro', badge: 'PRO' },
      { icon: '⚙️', label: 'Settings', href: '/settings', minRole: 'pro' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { icon: '🛡️', label: 'Control Panel', href: '/admin/panel', minRole: 'admin' },
      { icon: '📂', label: 'Data Management', href: '/admin/data', minRole: 'admin' },
      { icon: '🎛️', label: 'Feature Flags', href: '/admin/features', minRole: 'admin' },
      { icon: '🧠', label: 'AI Model', href: '/admin/ai', minRole: 'admin' },
    ],
  },
];

const ROLE_HIERARCHY: Record<UserRole, number> = {
  free: 0,
  pro: 1,
  business_manager: 2,
  business_auctioneer: 2,
  admin: 3,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser, setLoading } = useAuthStore();
  const { teamTheme, applyTheme } = useThemeStore();
  const { isCollapsed, isMobileOpen, toggle, setMobileOpen } = useSidebarStore();
  const [initialized, setInitialized] = useState(false);

  // Initialize auth
  useEffect(() => {
    const supabase = getSupabase();

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          avatar_url: session.user.user_metadata?.avatar_url || null,
          role: (session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) ? 'admin' : 'free' as UserRole,
          team_abbreviation: null,
          franchise_id: null,
          created_at: session.user.created_at,
        });
      } else {
        const hasKeys = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your-supabase-url';
        if (!hasKeys) {
          // Dev mock user
          setUser({
            id: 'mock-user-id',
            email: 'admin@demo.com',
            full_name: 'Demo Admin',
            avatar_url: null,
            role: 'admin',
            team_abbreviation: 'CSK',
            franchise_id: null,
            created_at: new Date().toISOString(),
          });
        } else {
          router.push('/login');
          return;
        }
      }

      setLoading(false);
      setInitialized(true);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session) {
          setUser(null);
          router.push('/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setLoading, router]);

  // Apply theme on mount
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  const handleLogout = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  if (!initialized) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48,
            height: 48,
            background: 'var(--theme-gradient)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            margin: '0 auto var(--space-4)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}>
            🏏
          </div>
          <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const userRole = user?.role || 'free';
  const userRoleLevel = ROLE_HIERARCHY[userRole];

  const getPageTitle = () => {
    const allItems = NAV_GROUPS.flatMap((g) => g.items);
    const match = allItems.find((item) => pathname.startsWith(item.href));
    return match?.label || 'Dashboard';
  };

  return (
    <div className={styles['dashboard-layout']}>
      {/* Sidebar Overlay (mobile) */}
      <div
        className={cn(styles['sidebar-overlay'], isMobileOpen && styles.visible)}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          styles.sidebar,
          isCollapsed && styles.collapsed,
          isMobileOpen && styles['mobile-open']
        )}
      >
        <div className={styles['sidebar-header']}>
          <div className={styles['sidebar-logo']}>🏏</div>
          <div className={styles['sidebar-title']}>
            IPL <span>Arena</span>
          </div>
        </div>

        <nav className={styles['sidebar-nav']}>
          {NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter(
              (item) => ROLE_HIERARCHY[item.minRole] <= userRoleLevel
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.label} className={styles['nav-group']}>
                <div className={styles['nav-group-label']}>{group.label}</div>
                {visibleItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      styles['nav-item'],
                      pathname.startsWith(item.href) && styles.active
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className={styles['nav-item-icon']}>{item.icon}</span>
                    <span className={styles['nav-item-label']}>{item.label}</span>
                    {item.badge && (
                      <span className={styles['nav-item-badge']}>{item.badge}</span>
                    )}
                  </Link>
                ))}
              </div>
            );
          })}
        </nav>

        <div className={styles['sidebar-footer']}>
          <div className={styles['sidebar-user']}>
            <div className={styles['sidebar-avatar']}>
              {user ? getInitials(user.full_name) : '?'}
            </div>
            <div className={styles['sidebar-user-info']}>
              <div className={styles['sidebar-user-name']}>
                {user?.full_name || 'User'}
              </div>
              <div className={styles['sidebar-user-role']}>
                {user?.role?.replace('_', ' ') || 'free'}
              </div>
            </div>
          </div>
          <button
            className={styles['sidebar-toggle']}
            onClick={toggle}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(styles['main-content'], isCollapsed && styles.collapsed)}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles['header-left']}>
            <button
              className={styles['mobile-menu-btn']}
              onClick={() => setMobileOpen(true)}
            >
              ☰
            </button>
            <h1 className={styles['header-title']}>{getPageTitle()}</h1>
          </div>

          <div className={styles['header-right']}>
            {teamTheme && (
              <div className={styles['header-team-badge']}>
                🏏 {teamTheme}
              </div>
            )}
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className={styles['page-content']}>
          {children}
        </div>
      </main>
    </div>
  );
}
