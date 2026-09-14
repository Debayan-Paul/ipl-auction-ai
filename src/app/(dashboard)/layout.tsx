'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { useAuthStore, useThemeStore, useSidebarStore } from '@/lib/store';
import { getInitials, cn } from '@/lib/utils';
import type { UserRole } from '@/lib/types';
import RazorpayCheckout from '@/components/RazorpayCheckout';
import styles from './dashboard.module.css';

interface NavItem {
  icon: string;
  label: string;
  href: string;
  minRole: UserRole;
  badge?: string;
  adminOnly?: boolean;
}

const NAV_GROUPS: {
  label: string;
  items: NavItem[];
  adminOnly?: boolean;
  minRole?: UserRole;
}[] = [
  {
    label: 'Overview',
    items: [
      { icon: '🏠', label: 'My Account', href: '/home', minRole: 'free' },
    ],
  },
  {
    label: 'Fan Analytics',
    items: [
      { icon: '📊', label: 'Player Stats', href: '/stats', minRole: 'free' },
      { icon: '⚔️', label: 'Compare Players', href: '/compare', minRole: 'free' },
    ],
  },
  {
    label: 'Pro Suite',
    minRole: 'pro',
    items: [
      { icon: '🤖', label: 'AI Predictions', href: '/predictions', minRole: 'pro', badge: 'PRO' },
      { icon: '🏟️', label: 'Team vs Team', href: '/team-compare', minRole: 'pro', badge: 'PRO' },
      { icon: '🎲', label: 'Digital Twin', href: '/simulations', minRole: 'pro', badge: 'PRO' },
      { icon: '📺', label: 'Live Auction', href: '/live-auction', minRole: 'pro', badge: 'PRO' },
      { icon: '⚙️', label: 'Settings', href: '/settings', minRole: 'pro' },
    ],
  },
  {
    label: 'Business Suite',
    minRole: 'business_manager',
    items: [
      { icon: '🏢', label: 'Franchise War Room', href: '/live-auction?mode=manager', minRole: 'business_manager', badge: 'FRANCHISE' },
      { icon: '🔨', label: 'Auctioneer Podium', href: '/live-auction?mode=auctioneer', minRole: 'business_auctioneer', badge: 'OFFICIAL' },
    ],
  },
  {
    label: 'Admin Control Center',
    adminOnly: true,
    items: [
      { icon: '🛡️', label: 'Control Panel', href: '/admin/panel', minRole: 'admin', adminOnly: true },
      { icon: '👥', label: 'User Management', href: '/admin/users', minRole: 'admin', adminOnly: true },
      { icon: '📂', label: 'Data Management', href: '/admin/data', minRole: 'admin', adminOnly: true },
      { icon: '🎛️', label: 'Feature Flags', href: '/admin/features', minRole: 'admin', adminOnly: true },
      { icon: '🧠', label: 'AI Model', href: '/admin/ai', minRole: 'admin', adminOnly: true },
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
  const { teamTheme, setTeamTheme, applyTheme, resetToDefaultTheme } = useThemeStore();
  const { isCollapsed, isMobileOpen, toggle, setMobileOpen } = useSidebarStore();
  const [initialized, setInitialized] = useState(false);

  // Initialize auth
  useEffect(() => {
    const supabase = getSupabase();

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        let userRole: UserRole = 'free';
        let fullName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User';
        let avatarUrl = session.user.user_metadata?.avatar_url || null;
        let teamAbbr = null;
        let franchiseId = null;

        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileData) {
            userRole = profileData.role || 'free';
            fullName = profileData.full_name || fullName;
            avatarUrl = profileData.avatar_url || avatarUrl;
            teamAbbr = profileData.team_abbreviation || null;
            franchiseId = profileData.franchise_id || null;
          }
        } catch (e) {
          console.warn('Error reading profile:', e);
        }

        const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'debayanpaul629@gmail.com').trim().toLowerCase();
        const emailLower = (session.user.email || '').trim().toLowerCase();
        if (emailLower === adminEmail) {
          userRole = 'admin';
        } else {
          // Fallback profile if table is empty
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            avatar_url: null,
            role: 'free',
            team_abbreviation: 'DEFAULT',
            franchise_id: null,
            created_at: session.user.created_at,
          });
        }
      } else {
        // In dev mode, provide fallback demo admin if session fails
        if (process.env.NODE_ENV === 'development') {
          setUser({
            id: '00000000-0000-0000-0000-000000000001',
            email: 'debayanpaul629@gmail.com',
            full_name: 'Debayan Paul',
            avatar_url: null,
            role: 'admin',
            team_abbreviation: 'DEFAULT',
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
          resetToDefaultTheme();
          setUser(null);
          router.push('/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setLoading, router, setTeamTheme, resetToDefaultTheme]);

  // Apply theme on mount
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  const handleLogout = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    resetToDefaultTheme();
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

  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'debayanpaul629@gmail.com').trim().toLowerCase();
  const currentUserEmail = (user?.email || '').trim().toLowerCase();
  const isAdmin = currentUserEmail === adminEmail;
  const userRole = isAdmin ? 'admin' : (user?.role === 'admin' ? 'free' : user?.role || 'free');
  const userRoleLevel = ROLE_HIERARCHY[userRole];

  const getPageTitle = () => {
    const allItems = NAV_GROUPS.flatMap((g) => g.items);
    const match = allItems.find((item) => pathname.startsWith(item.href.split('?')[0]));
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
        <Link
          href="/"
          title="Exit to Landing Page"
          style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
        >
          <div className={styles['sidebar-header']}>
            <div className={styles['sidebar-logo']}>🏏</div>
            <div className={styles['sidebar-title']}>
              IPL <span>Arena</span>
            </div>
          </div>
        </Link>

        <nav className={styles['sidebar-nav']}>
          {NAV_GROUPS.map((group) => {
            // Strictly hide admin panel from ANY user who is not debayanpaul629@gmail.com
            if (group.adminOnly && !isAdmin) {
              return null;
            }

            // Hide higher tier groups
            if (group.minRole && ROLE_HIERARCHY[group.minRole] > userRoleLevel) {
              return null;
            }

            const visibleItems = group.items.filter((item) => {
              if (item.adminOnly && !isAdmin) return false;
              if (item.minRole === 'admin' && !isAdmin) return false;
              return ROLE_HIERARCHY[item.minRole] <= userRoleLevel;
            });

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
                      pathname.startsWith(item.href.split('?')[0]) && styles.active
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

          {/* Upgrade Card for Free Users */}
          {userRole === 'free' && !isCollapsed && (
            <div style={{ margin: '16px 12px', padding: '14px', borderRadius: '12px', background: 'rgba(255, 215, 0, 0.07)', border: '1px solid rgba(255, 215, 0, 0.25)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#ffd700', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>⭐</span> Upgrade to Pro
              </div>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                Unlock AI 2027 Projections, Team Comparisons & Digital Twin.
              </p>
              <RazorpayCheckout
                amount={999}
                description="Pro Plan - 1 Year Unlimited Access"
                buttonText="Get Pro (₹999)"
                className="btn btn-primary btn-sm"
                style={{ width: '100%', fontSize: 12, padding: '7px', textAlign: 'center', display: 'block', marginTop: 0 }}
              />
            </div>
          )}
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
