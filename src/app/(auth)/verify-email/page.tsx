'use client';

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BackButton from '../components/BackButton';
import styles from '../auth.module.css';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState('');

  // Auto-verify if token is provided in URL
  useEffect(() => {
    if (token) {
      verifyWithToken(token);
    }
  }, [token]);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const verifyWithToken = async (verificationToken: string) => {
    setStatus('loading');
    setMessage('Verifying your email address...');

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('✅ Email verified successfully! Redirecting to sign in...');
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 2200);
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed or link expired.');
      }
    } catch {
      setStatus('error');
      setMessage('An unexpected error occurred during verification.');
    }
  };

  const submitVerification = async (targetEmail: string, targetCode: string) => {
    if (!targetCode || targetCode.length < 6 || !targetEmail) return;

    setStatus('loading');
    setMessage('Verifying your code...');

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, code: targetCode }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('✅ Email verified successfully! Redirecting to sign in...');
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Invalid or expired code.');
      }
    } catch {
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again.');
    }
  };

  const handleManualVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      setStatus('error');
      setMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    if (!email) {
      setStatus('error');
      setMessage('Please provide the registered email address.');
      return;
    }

    await submitVerification(email, code);
  };

  const handleCodeChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setCode(cleaned);
    if (cleaned.length === 6 && email) {
      submitVerification(email, cleaned);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;

    setResendStatus('Sending new code...');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setResendCooldown(60); // 60s cooldown
        setResendStatus('✅ New verification link & code sent!');
        setTimeout(() => setResendStatus(''), 5000);
      } else {
        setResendStatus(data.error || 'Failed to resend code');
      }
    } catch {
      setResendStatus('Failed to resend verification');
    }
  };

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
            <div className={styles['auth-logo-icon']}>✉️</div>
            <h1>Verify Your Email</h1>
            <p>
              {email ? (
                <>We sent a verification code to <strong>{email}</strong></>
              ) : (
                'Enter the verification code sent to your email'
              )}
            </p>
          </div>

          {status === 'success' && <div className={styles['auth-success']}>{message}</div>}
          {status === 'error' && <div className={styles['auth-error']}>{message}</div>}
          {resendStatus && <div className={styles['auth-success']}>{resendStatus}</div>}

          {status !== 'success' && (
            <form className={styles['auth-form']} onSubmit={handleManualVerify}>
              {!emailParam && (
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
                    disabled={status === 'loading'}
                  />
                </div>
              )}

              <div className="input-group">
                <label className="input-label" htmlFor="code">6-Digit Code</label>
                <input
                  id="code"
                  type="text"
                  maxLength={6}
                  autoFocus
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className={`input ${styles['auth-otp-input']}`}
                  placeholder="••••••"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  required
                  disabled={status === 'loading'}
                />
              </div>

              <button
                type="submit"
                className={`btn btn-primary btn-lg ${styles['auth-submit']}`}
                disabled={status === 'loading' || code.length < 6}
              >
                {status === 'loading' ? 'Verifying...' : 'Verify Email'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || !email}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 13 }}
                >
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Didn't receive email? Resend code"}
                </button>
              </div>
            </form>
          )}

          {status === 'success' && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Link href="/login" className="btn btn-primary">
                Proceed to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className={styles['auth-page']}>
          <div className={styles['auth-container']}>
            <div className={styles['auth-card']}>
              <p style={{ textAlign: 'center' }}>Loading verification...</p>
            </div>
          </div>
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
