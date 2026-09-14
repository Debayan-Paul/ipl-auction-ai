'use client';

import { useState, FormEvent, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import BackButton from '../components/BackButton';
import styles from '../auth.module.css';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. If token is present in the URL, user is authorized via token
    if (token) {
      setIsAuthorized(true);
      return;
    }

    // 2. Otherwise check for active Supabase recovery session (redirected from Supabase email)
    const checkSession = async () => {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setIsAuthorized(true);
        return;
      }

      // Listen for auth state change in case of recovery event
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY' || session?.user) {
          setIsAuthorized(true);
        }
      });

      // Give brief grace period for session hydration
      const timeout = setTimeout(() => {
        setIsAuthorized(prev => (prev === null ? false : prev));
      }, 1500);

      return () => {
        subscription.unsubscribe();
        clearTimeout(timeout);
      };
    };

    checkSession();
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      if (token) {
        // Method A: Direct custom token API
        const res = await fetch('/api/auth/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage('✅ Password reset successfully! Redirecting to login...');
          setTimeout(() => router.push('/login?reset=success'), 2000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to reset password');
        }
      } else {
        // Method B: Supabase Auth Recovery Session
        const supabase = getSupabase();
        const { error: updateError } = await supabase.auth.updateUser({ password });

        if (updateError) {
          setStatus('error');
          setMessage(updateError.message || 'Failed to reset password');
        } else {
          setStatus('success');
          setMessage('✅ Password reset successfully! Redirecting to login...');
          setTimeout(() => router.push('/login?reset=success'), 2000);
        }
      }
    } catch {
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again.');
    }
  };

  if (isAuthorized === false) {
    return (
      <div className={styles['auth-page']}>
        <BackButton href="/login" label="Back to Login" />
        <div className={styles['auth-container']}>
          <div className={styles['auth-card']}>
            <div className={styles['auth-logo']}>
              <div className={styles['auth-logo-icon']}>⚠️</div>
              <h1>Link Expired or Invalid</h1>
              <p>Your password reset link is invalid or has expired.</p>
            </div>
            <div className={styles['auth-error']} style={{ marginBottom: 20 }}>
              Please request a fresh reset link to securely update your password.
            </div>
            <div style={{ textAlign: 'center' }}>
              <Link href="/forgot-password" className="btn btn-primary">
                Request New Reset Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['auth-page']}>
      {/* Top Left of Display Back Button */}
      <BackButton href="/login" label="Back to Login" />

      <div className={styles['auth-bg']}>
        <div className={styles['auth-bg-orb']} />
        <div className={styles['auth-bg-orb']} />
      </div>

      <div className={styles['auth-container']}>
        <div className={styles['auth-card']}>
          <div className={styles['auth-logo']}>
            <div className={styles['auth-logo-icon']}>🏏</div>
            <h1>Set New Password</h1>
            <p>Enter your new password below</p>
          </div>

          {status === 'success' && <div className={styles['auth-success']}>{message}</div>}
          {status === 'error' && <div className={styles['auth-error']}>{message}</div>}

          {status !== 'success' && (
            <form className={styles['auth-form']} onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label" htmlFor="password">New Password</label>
                <input
                  id="password"
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={status === 'loading'}
                  minLength={6}
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={status === 'loading'}
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className={`btn btn-primary btn-lg ${styles['auth-submit']}`}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className={styles['auth-page']}>
          <div className={styles['auth-container']}>
            <div className={styles['auth-card']}>
              <p style={{ textAlign: 'center' }}>Loading password reset...</p>
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
