'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import BackButton from '../components/BackButton';
import OtpInput from '../components/OtpInput';
import styles from '../auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegisterAndSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!isVerified) {
      setError('Please click "Send OTP" to receive your 6-digit verification code, then click "Verify" before signing in.');
      return;
    }

    setLoading(true);

    try {
      // 1. Sign in to Supabase directly
      const supabase = getSupabase();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // 2. Direct user to landing page (logged in)
      router.push('/');
    } catch {
      setError('An unexpected error occurred during sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const supabase = getSupabase();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        setError(authError.message);
      }
    } catch {
      setError('Failed to initiate Google sign-up');
    }
  };

  return (
    <div className={styles['auth-page']}>
      {/* Top Left of Display Back Button */}
      <BackButton href="/" label="Back to Home" />

      <div className={styles['auth-bg']}>
        <div className={styles['auth-bg-orb']} />
        <div className={styles['auth-bg-orb']} />
      </div>

      <div className={styles['auth-container']}>
        <div className={styles['auth-card']}>
          <div className={styles['auth-logo']}>
            <div className={styles['auth-logo-icon']}>🏏</div>
            <h1>Create Account</h1>
            <p>Join the IPL Auction Arena — it&apos;s free</p>
          </div>

          {error && <div className={styles['auth-error']}>{error}</div>}
          {success && <div className={styles['auth-success']}>{success}</div>}

          <form className={styles['auth-form']} onSubmit={handleRegisterAndSignIn}>
            <div className="input-group">
              <label className="input-label" htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                className="input"
                placeholder="Virat Kohli"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || isVerified}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading || isVerified}
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
                disabled={loading || isVerified}
              />
            </div>

            {/* Space under Password for 6-Digit OTP & Beside Verify Button */}
            <OtpInput
              email={email}
              password={password}
              fullName={fullName}
              isVerified={isVerified}
              setIsVerified={setIsVerified}
              onError={setError}
              onSuccess={(msg) => {
                setError('');
                setSuccess(msg);
              }}
            />

            <button
              type="submit"
              className={`btn btn-primary btn-lg ${styles['auth-submit']}`}
              disabled={loading}
              style={{
                background: isVerified ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : undefined,
                borderColor: isVerified ? '#22c55e' : undefined,
              }}
            >
              {loading
                ? 'Signing in...'
                : isVerified
                ? '🏏 Sign In to Dashboard'
                : 'Verify Email First to Sign In'}
            </button>
          </form>

          <div className={styles['auth-divider']}>
            <span>or continue with</span>
          </div>

          <button className={styles['btn-google']} onClick={handleGoogleSignup} type="button">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className={styles['auth-footer']}>
            Already have an account? <Link href="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
