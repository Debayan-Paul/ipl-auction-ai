'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = getSupabase();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        }
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['auth-page']}>
      <div className={styles['auth-bg']}>
        <div className={styles['auth-bg-orb']} />
        <div className={styles['auth-bg-orb']} />
      </div>

      <div className={styles['auth-container']}>
        <div className={styles['auth-card']}>
          <div className={styles['auth-logo']}>
            <div className={styles['auth-logo-icon']}>🔑</div>
            <h1>Forgot Password</h1>
            <p>Enter your email and we&apos;ll send you a reset link</p>
          </div>

          {error && <div className={styles['auth-error']}>{error}</div>}

          {success ? (
            <div className={styles['auth-success']}>
              ✅ If an account exists for <strong>{email}</strong>, a password
              reset link is on its way. Check your inbox (and spam folder), then
              follow the link to choose a new password.
            </div>
          ) : (
            <form className={styles['auth-form']} onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className={`btn btn-primary btn-lg ${styles['auth-submit']}`}
                disabled={loading}
              >
                {loading ? 'Sending link...' : '📧 Send Reset Link'}
              </button>
            </form>
          )}

          <div className={styles['auth-footer']}>
            Remembered your password? <Link href="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
