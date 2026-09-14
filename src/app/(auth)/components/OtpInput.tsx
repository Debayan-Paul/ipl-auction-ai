'use client';

import { useState, useEffect } from 'react';
import styles from '../auth.module.css';

interface OtpInputProps {
  email: string;
  password?: string;
  fullName?: string;
  isVerified: boolean;
  setIsVerified: (val: boolean) => void;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

export default function OtpInput({
  email,
  password,
  fullName,
  isVerified,
  setIsVerified,
  onError,
  onSuccess,
}: OtpInputProps) {
  const [code, setCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Countdown timer for resending
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      onError('Please enter a valid email address first.');
      return;
    }

    if (password && password.length < 6) {
      onError('Password must be at least 6 characters before requesting OTP.');
      return;
    }

    setLoading(true);
    onError('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.alreadyVerified) {
          setIsVerified(true);
          onSuccess('✅ Account is already verified. You can sign in directly!');
        } else {
          setOtpSent(true);
          setCooldown(60);
          onSuccess(`📨 6-digit OTP sent to ${email}! Check your inbox.`);
        }
      } else {
        onError(data.error || 'Failed to send OTP code.');
      }
    } catch {
      onError('Network error. Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (codeToVerify: string) => {
    if (!codeToVerify || codeToVerify.length < 6) {
      onError('Please enter all 6 digits of the verification code.');
      return;
    }

    if (!email) {
      onError('Please enter your email address.');
      return;
    }

    setLoading(true);
    onError('');

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: codeToVerify }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsVerified(true);
        onSuccess('✅ Email verified! Click "Sign In" below to enter.');
      } else {
        onError(data.error || 'Invalid or expired OTP code.');
      }
    } catch {
      onError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setCode(cleaned);

    // Auto-verify as soon as 6 digits are typed or pasted
    if (cleaned.length === 6 && !isVerified) {
      handleVerifyOtp(cleaned);
    }
  };

  return (
    <div className="input-group" style={{ marginTop: 'var(--space-1)' }}>
      <label className="input-label" htmlFor="otp-input" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>6-Digit Verification Code</span>
        {isVerified && <span style={{ color: '#22c55e', fontWeight: 700 }}>✓ Verified</span>}
      </label>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          id="otp-input"
          type="text"
          maxLength={6}
          inputMode="numeric"
          autoComplete="one-time-code"
          className="input"
          style={{
            fontFamily: 'monospace',
            fontSize: 18,
            letterSpacing: 6,
            fontWeight: 700,
            textAlign: 'center',
            flex: 1,
            borderColor: isVerified ? '#22c55e' : undefined,
            background: isVerified ? 'rgba(34, 197, 94, 0.08)' : undefined,
          }}
          placeholder={isVerified ? 'VERIFIED' : '••••••'}
          value={isVerified ? 'VERIFIED' : code}
          onChange={(e) => handleCodeChange(e.target.value)}
          disabled={loading || isVerified}
        />

        {!isVerified ? (
          <button
            type="button"
            onClick={otpSent ? () => handleVerifyOtp(code) : handleSendOtp}
            disabled={loading || (otpSent && code.length < 6)}
            className="btn btn-secondary"
            style={{
              whiteSpace: 'nowrap',
              minWidth: 105,
              padding: '10px 14px',
              fontSize: 13,
              fontWeight: 700,
              background: otpSent ? 'var(--theme-primary, #ffd700)' : undefined,
              color: otpSent ? '#000000' : undefined,
            }}
          >
            {loading ? 'Processing...' : otpSent ? 'Verify' : 'Send OTP'}
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="btn"
            style={{
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#22c55e',
              border: '1px solid #22c55e',
              minWidth: 105,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'default',
            }}
          >
            ✓ Verified
          </button>
        )}
      </div>

      {otpSent && !isVerified && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: 12 }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Code sent to your email</span>
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={cooldown > 0 || loading}
            style={{
              background: 'none',
              border: 'none',
              color: cooldown > 0 ? 'var(--color-text-muted)' : 'var(--theme-primary, #ffd700)',
              cursor: cooldown > 0 ? 'default' : 'pointer',
              textDecoration: cooldown > 0 ? 'none' : 'underline',
              padding: 0,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
          </button>
        </div>
      )}
    </div>
  );
}
