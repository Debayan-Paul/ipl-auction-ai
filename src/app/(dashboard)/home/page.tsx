'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { useAuthStore, useThemeStore } from '@/lib/store';
import { TEAM_THEMES, TeamAbbreviation } from '@/lib/team-themes';
import RazorpayCheckout from '@/components/RazorpayCheckout';
import DeleteAccountModal from '@/components/DeleteAccountModal';

export default function HomePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { teamTheme, setTeamTheme, resetToDefaultTheme } = useThemeStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<TeamAbbreviation>((teamTheme as TeamAbbreviation) || 'DEFAULT');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Profile Edit State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setProfile(data.profile);
            setFullName(data.profile.full_name || '');
            setPhone(data.profile.phone || '');
            const team = data.profile.team_abbreviation || 'DEFAULT';
            setSelectedTeam(team);
            setTeamTheme(team);
            setUser({
              id: data.profile.id,
              email: data.profile.email,
              full_name: data.profile.full_name,
              avatar_url: null,
              role: data.profile.role,
              team_abbreviation: team,
              franchise_id: null,
              created_at: new Date().toISOString(),
            });
            return;
          }
        }

        // Fallback to supabase auth session
        const supabase = getSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push('/login');
          return;
        }

        const fallbackName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '';
        const fallbackPhone = session.user.user_metadata?.phone || '';
        setFullName(fallbackName);
        setPhone(fallbackPhone);
        setProfile({
          email: session.user.email,
          full_name: fallbackName,
          phone: fallbackPhone,
          role: 'free',
        });
      } catch (err) {
        console.error('Error fetching account details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router, setTeamTheme, setUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          phone: phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      setProfileMsg({ type: 'success', text: '✓ Account details updated successfully!' });
      setProfile((prev: any) => ({
        ...prev,
        full_name: fullName.trim(),
        phone: phone.trim(),
      }));

      // Update auth store
      if (user) {
        setUser({
          ...user,
          full_name: fullName.trim(),
        });
      }

      setTimeout(() => setProfileMsg(null), 4000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setProfileMsg({ type: 'error', text: err.message || 'Error updating profile' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleTeamChange = async (teamAbbr: TeamAbbreviation) => {
    setSelectedTeam(teamAbbr);
    setTeamTheme(teamAbbr);

    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_abbreviation: teamAbbr }),
      });
    } catch (err) {
      console.error('Error saving team theme:', err);
    }
  };

  const handleSignOut = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    resetToDefaultTheme();
    setUser(null);
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading account details...</p>
      </div>
    );
  }

  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'debayanpaul629@gmail.com').trim().toLowerCase();
  const currentEmail = (profile?.email || user?.email || '').trim().toLowerCase();
  const isAdmin = currentEmail === adminEmail;
  const userRole = isAdmin ? 'admin' : (profile?.role === 'admin' ? 'free' : profile?.role || user?.role || 'free');

  const roleDisplayNames: Record<string, string> = {
    free: 'Free Plan',
    pro: 'Pro Member',
    business_manager: 'Franchise Manager (Business)',
    business_auctioneer: 'Official Auctioneer (Business)',
    admin: 'System Administrator',
  };

  const currentThemeObj = TEAM_THEMES[selectedTeam] || TEAM_THEMES.DEFAULT;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', maxWidth: 900, margin: '0 auto', paddingBottom: 'var(--space-12)' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
              🏏 Account Details
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-md)' }}>
              Welcome back, <strong>{profile?.full_name || user?.full_name || 'Manager'}</strong>. Manage your profile, phone number, and franchise theme.
            </p>
          </div>
          <button onClick={handleSignOut} className="btn btn-ghost" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Account Details Overview Card */}
      <div className="glass-card" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'var(--theme-gradient, linear-gradient(135deg, #ffd700, #ff8c00))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--text-2xl)',
              fontWeight: 800,
              color: '#000000',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            }}
          >
            {(profile?.full_name || user?.full_name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, margin: 0 }}>
                {profile?.full_name || user?.full_name || 'Manager'}
              </h2>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: 9999,
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: userRole === 'pro' || userRole === 'admin' ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                  color: userRole === 'pro' || userRole === 'admin' ? '#ffd700' : 'var(--color-text-secondary)',
                  border: '1px solid currentColor',
                }}
              >
                {roleDisplayNames[userRole] || userRole}
              </span>
            </div>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 4, marginBottom: 0 }}>
              {profile?.email || user?.email} {profile?.phone ? `• 📞 ${profile.phone}` : ''}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Membership Tier
            </div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: '#ffffff', marginTop: 4 }}>
              {roleDisplayNames[userRole] || userRole}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Phone Number
            </div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: profile?.phone ? '#ffffff' : 'var(--color-text-muted)', marginTop: 4 }}>
              {profile?.phone || 'Not configured'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Account Theme
            </div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--theme-primary, #ffd700)', marginTop: 4 }}>
              {currentThemeObj.name}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Details Form */}
      <div className="glass-card" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
        <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
          ✏️ Edit Profile Details
        </h3>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
          Update your display name and contact phone number. These details will be synchronized across your account.
        </p>

        <form onSubmit={handleSaveProfile}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
            <div className="input-group">
              <label className="input-label" style={{ fontWeight: 600, marginBottom: 6 }}>Full Name</label>
              <input
                type="text"
                className="input"
                placeholder="Enter your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" style={{ fontWeight: 600, marginBottom: 6 }}>Phone Number</label>
              <input
                type="tel"
                className="input"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {profileMsg && (
            <div
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-4)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                background: profileMsg.type === 'success' ? 'rgba(46, 160, 67, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: profileMsg.type === 'success' ? 'var(--color-success)' : '#ef4444',
                border: `1px solid ${profileMsg.type === 'success' ? 'rgba(46, 160, 67, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              }}
            >
              {profileMsg.text}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={savingProfile}
            style={{ padding: '10px 24px', fontWeight: 700 }}
          >
            {savingProfile ? '💾 Saving Changes...' : '💾 Save Profile Details'}
          </button>
        </form>
      </div>

      {/* Franchise & Account Dynamic Theming */}
      <div className="glass-card" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
        <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
          🎨 Account Theme & Franchise Alignment
        </h3>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)' }}>
          Choose your account’s theme. It persists while you are logged in and automatically reverts to the default glowy scheme when you sign out.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
          {(Object.keys(TEAM_THEMES) as TeamAbbreviation[]).map((abbr) => {
            const theme = TEAM_THEMES[abbr];
            const isSelected = selectedTeam === abbr;
            return (
              <button
                key={abbr}
                type="button"
                onClick={() => handleTeamChange(abbr)}
                style={{
                  padding: '12px 10px',
                  borderRadius: 'var(--radius-lg)',
                  border: isSelected ? `2px solid ${theme.primary}` : '1px solid rgba(255,255,255,0.1)',
                  background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.2)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                  transform: isSelected ? 'scale(1.02)' : 'none',
                }}
              >
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: theme.primary, border: '1px solid rgba(255,255,255,0.3)' }} />
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: theme.secondary, border: '1px solid rgba(255,255,255,0.3)' }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, textAlign: 'center' }}>
                  {theme.abbreviation === 'DEFAULT' ? 'Default Glow' : theme.name}
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                  {theme.abbreviation === 'DEFAULT' ? 'White & Black' : theme.abbreviation}
                </div>
                {isSelected && (
                  <span style={{ fontSize: 10, color: theme.primary, fontWeight: 800 }}>
                    ✓ Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div
        className="glass-card"
        style={{
          padding: 'var(--space-6)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          background: 'rgba(239, 68, 68, 0.04)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-2)' }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <h3 style={{ color: '#ef4444', margin: 0, fontSize: 'var(--text-lg)' }}>Danger Zone</h3>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
          Permanently delete your account and all associated data. Once initiated, your profile, team theming, custom strategies, and saved comparisons will be erased forever. This action is irreversible.
        </p>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            color: '#ef4444',
            fontWeight: 700,
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ef4444';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
            e.currentTarget.style.color = '#ef4444';
          }}
        >
          🗑️ Delete Account
        </button>
      </div>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
