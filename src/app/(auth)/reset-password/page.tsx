'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import styles from '../auth.module.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);
    };
    checkSession();

    const supabase = getSupabase();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setHasSession(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const supabase = getSupabase();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) { setError(updateError.message); return; }
      await supabase.auth.signOut();
      setSuccess(true);
      setTimeout(() => router.push('/login?reset=success'), 2500);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (hasSession === null) {
    return (
      <div className={styles['auth-page']}>
        <div className={styles['auth-bg']}><div className={styles['auth-bg-orb']} /><div className={styles['auth-bg-orb']} /></div>
        <div className={styles['auth-container']}>
          <div className={styles['auth-card']}>
            <div className={styles['auth-logo']}>
              <div className={styles['auth-logo-icon']}>⏳</div>
              <h1>Verifying…</h1><p>Checking your reset link</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className={styles['auth-page']}>
        <div className={styles['auth-bg']}><div className={styles['auth-bg-orb']} /><div className={styles['auth-bg-orb']} /></div>
        <div className={styles['auth-container']}>
          <div className={styles['auth-card']}>
            <div className={styles['auth-logo']}>
              <div className={styles['auth-logo-icon']}>⚠️</div>
              <h1>Link Expired</h1>
              <p>This password reset link is invalid or has expired.</p>
            </div>
            <Link href="/forgot-password" className={`btn btn-primary btn-lg ${styles['auth-submit']}`}
              style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              🔑 Request a New Link
            </Link>
            <div className={styles['auth-footer']}>Back to <Link href="/login">Sign in</Link></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['auth-page']}>
      <div className={styles['auth-bg']}><div className={styles['auth-bg-orb']} /><div className={styles['auth-bg-orb']} /></div>
      <div className={styles['auth-container']}>
        <div className={styles['auth-card']}>
          <div className={styles['auth-logo']}>
            <div className={styles['auth-logo-icon']}>🔒</div>
            <h1>Reset Password</h1><p>Choose a new password for your account</p>
          </div>
          {error && <div className={styles['auth-error']}>{error}</div>}
          {success ? (
            <div className={styles['auth-success']}>✅ Password updated! Redirecting to login…</div>
          ) : (
            <form className={styles['auth-form']} onSubmit={handleReset}>
              <div className="input-group">
                <label className="input-label" htmlFor="password">New Password</label>
                <input id="password" type="password" className="input" placeholder="Min 6 characters"
                  value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="confirmPassword">Confirm New Password</label>
                <input id="confirmPassword" type="password" className="input" placeholder="••••••••"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <button type="submit" className={`btn btn-primary btn-lg ${styles['auth-submit']}`} disabled={loading}>
                {loading ? 'Updating password...' : '🔒 Update Password'}
              </button>
            </form>
          )}
          <div className={styles['auth-footer']}>Back to <Link href="/login">Sign in</Link></div>
        </div>
      </div>
    </div>
  );
}
