import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile, UserRole, AuctionPhase, FeatureFlag } from './types';
import type { TeamAbbreviation } from './team-themes';

// === Auth Store ===
interface AuthState {
  user: Profile | null;
  isLoading: boolean;
  setUser: (user: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  isRole: (role: UserRole) => boolean;
  hasAccess: (minRole: UserRole) => boolean;
  logout: () => void;
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  free: 0,
  pro: 1,
  business_manager: 2,
  business_auctioneer: 2,
  admin: 3,
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  isRole: (role) => get().user?.role === role,
  hasAccess: (minRole) => {
    const user = get().user;
    if (!user) return false;
    return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[minRole];
  },
  logout: () => set({ user: null }),
}));

// === Theme Store ===
interface ThemeState {
  teamTheme: TeamAbbreviation | null;
  setTeamTheme: (team: TeamAbbreviation | null) => void;
  applyTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      teamTheme: null,
      setTeamTheme: (team) => {
        set({ teamTheme: team });
        if (typeof document !== 'undefined') {
          if (team) {
            document.documentElement.setAttribute('data-team', team);
          } else {
            document.documentElement.removeAttribute('data-team');
          }
        }
      },
      applyTheme: () => {
        const team = get().teamTheme;
        if (typeof document !== 'undefined' && team) {
          document.documentElement.setAttribute('data-team', team);
        }
      },
    }),
    {
      name: 'ipl-team-theme',
    }
  )
);

// === Feature Flags Store ===
interface FeatureFlagState {
  currentPhase: AuctionPhase;
  flags: FeatureFlag[];
  setPhase: (phase: AuctionPhase) => void;
  setFlags: (flags: FeatureFlag[]) => void;
  isFeatureEnabled: (featureKey: string) => boolean;
}

export const useFeatureFlagStore = create<FeatureFlagState>()((set, get) => ({
  currentPhase: 'before',
  flags: [],
  setPhase: (currentPhase) => set({ currentPhase }),
  setFlags: (flags) => set({ flags }),
  isFeatureEnabled: (featureKey) => {
    const { flags, currentPhase } = get();
    const flag = flags.find(
      (f) => f.feature_key === featureKey && f.auction_phase === currentPhase
    );
    return flag?.enabled ?? true;
  },
}));

// === Sidebar Store ===
interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggle: () => void;
  setMobileOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()((set) => ({
  isCollapsed: false,
  isMobileOpen: false,
  toggle: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
  setMobileOpen: (isMobileOpen) => set({ isMobileOpen }),
}));
