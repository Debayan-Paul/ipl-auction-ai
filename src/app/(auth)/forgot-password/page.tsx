'use client';

import { useState, FormEvent, Suspense } from 'react';
import Link from 'next/link';
import BackButton from '../components/BackButton';
import styles from '../auth.module.css';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [sandboxRestricted, setSandboxRestricted] = useState(false);
  const [devCode, setDevCode] = useState('');

  const handleRequestReset = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('idle');
        setStep('verify');
        if (data.sandboxRestricted || data.otpCode) {
          setSandboxRestricted(true);
          setDevCode(data.otpCode || '');
          if (data.otpCode) setCode(data.otpCode);
          setMessage(data.message || '6-digit reset code generated.');
        } else {
          setMessage(data.message || 'Password reset link and 6-digit code sent. Please check your inbox.');
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to request reset');
      }
    } catch {
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again.');
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
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
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('✅ Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/login?reset=success';
        }, 1800);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to reset password');
      }
    } catch {
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again.');
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
            <div className={styles['auth-logo-icon']}>🏏</div>
            <h1>{step === 'request' ? 'Reset Password' : 'Set New Password'}</h1>
            <p>
              {step === 'request'
                ? 'Enter your email to receive a secure reset link and 6-digit code'
                : `Enter the 6-digit code sent for ${email}`}
            </p>
          </div>

          {sandboxRestricted && devCode && step === 'verify' && (
            <div
              style={{
                background: 'rgba(255, 193, 7, 0.12)',
                border: '1px solid rgba(255, 193, 7, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: 20,
                fontSize: 13,
                lineHeight: 1.5,
                color: '#ffc107',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                ⚡ Fast OTP Direct Reset
              </div>
              <div>
                Resend email sandbox restricts outbound email to <strong>debayanpaul983@gmail.com</strong> until a domain is verified. Your 6-digit verification code is <strong>{devCode}</strong> (autofilled below).
              </div>
            </div>
          )}

          {message && status === 'idle' && (
            <div className={styles['auth-success']} style={{ marginBottom: 16 }}>
              {message}
            </div>
          )}
          {status === 'success' && <div className={styles['auth-success']}>{message}</div>}
          {status === 'error' && <div className={styles['auth-error']}>{message}</div>}

          {status !== 'success' && step === 'request' && (
            <form className={styles['auth-form']} onSubmit={handleRequestReset}>
              <div className="input-group">
                <label className="input-label" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === 'loading'}
                />
              </div>

              <button
                type="submit"
                className={`btn btn-primary btn-lg ${styles['auth-submit']}`}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Generating Reset Code...' : 'Send Reset Link & Code'}
              </button>
            </form>
          )}

          {status !== 'success' && step === 'verify' && (
            <form className={styles['auth-form']} onSubmit={handleResetPassword}>
              <div className="input-group">
                <label className="input-label" htmlFor="code">6-Digit Reset Code</label>
                <input
                  id="code"
                  type="text"
                  className="input"
                  placeholder="123456"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  disabled={status === 'loading'}
                  style={{
                    letterSpacing: '4px',
                    fontFamily: 'monospace',
                    fontSize: 18,
                    fontWeight: 700,
                    textAlign: 'center',
                  }}
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="password">New Password</label>
                <input
                  id="password"
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={status === 'loading'}
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={status === 'loading'}
                />
              </div>

              <button
                type="submit"
                className={`btn btn-primary btn-lg ${styles['auth-submit']}`}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Updating Password...' : 'Reset Password & Sign In'}
              </button>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setStep('request');
                  setStatus('idle');
                  setMessage('');
                }}
                style={{ marginTop: 8, color: 'var(--color-text-muted)' }}
              >
                ← Back to Request Reset
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
