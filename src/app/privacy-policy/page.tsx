'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      color: 'var(--color-text-primary)',
      padding: '0',
    }}>
      {/* Header */}
      <nav style={{
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--glass-border)',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>🏏</span>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18 }}>
            IPL <span style={{ color: 'var(--theme-primary, #ffffff)' }}>Auction Arena</span>
          </span>
        </Link>
        <Link href="/" className="btn btn-ghost btn-sm">← Back to Home</Link>
      </nav>

      {/* Content */}
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '48px 24px 80px',
        animation: 'fadeIn 0.4s ease-out',
      }}>
        <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 40, fontSize: 'var(--text-sm)' }}>
          Last updated: September 14, 2026
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <section>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 12 }}>1. Information We Collect</h2>
            <p style={{ lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
              When you create an account on IPL Auction Arena, we collect the following personal information:
            </p>
            <ul style={{ marginTop: 12, paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              <li><strong>Account Data:</strong> Full name, email address, and phone number (optional).</li>
              <li><strong>Usage Data:</strong> Player comparisons, saved matchups, team theme preferences, and dashboard interactions.</li>
              <li><strong>Authentication Data:</strong> Encrypted session tokens managed by Supabase Auth for secure login.</li>
              <li><strong>Payment Data:</strong> Transaction records processed by Razorpay. We do not store full payment card details.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 12 }}>2. How We Use Your Information</h2>
            <ul style={{ paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              <li>To provide and personalize the IPL Auction Arena platform experience.</li>
              <li>To maintain your account, team preferences, and comparison history.</li>
              <li>To process Pro/Business subscription payments securely.</li>
              <li>To send essential account notifications (e.g., password resets, subscription changes).</li>
              <li>To improve our AI prediction models and platform performance.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 12 }}>3. Data Storage & Security</h2>
            <p style={{ lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
              Your data is stored securely on Supabase-managed PostgreSQL databases with row-level security (RLS) policies.
              All data transmission is encrypted via TLS/SSL. Authentication tokens are securely managed and never exposed
              to client-side JavaScript in plain text. We employ industry-standard security practices to protect your information.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 12 }}>4. Data Sharing</h2>
            <p style={{ lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
              We do not sell, trade, or rent your personal information to third parties. We may share anonymized,
              aggregated analytics data (e.g., total comparisons made, most compared players) for platform improvement.
              Payment processing is handled by Razorpay under their own privacy policy.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 12 }}>5. Your Rights</h2>
            <ul style={{ paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              <li><strong>Access:</strong> You can view all your personal data from the Account Details page.</li>
              <li><strong>Update:</strong> You can modify your name and phone number at any time.</li>
              <li><strong>Delete:</strong> You can permanently delete your account and all associated data from the Danger Zone section.</li>
              <li><strong>Export:</strong> Contact us to request a copy of your data.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 12 }}>6. Cookies & Local Storage</h2>
            <p style={{ lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
              We use browser local storage to persist your authentication session, team theme preferences, and recent
              comparison history. These are essential for the platform to function correctly. No third-party tracking
              cookies are used.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 12 }}>7. Contact</h2>
            <p style={{ lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
              For privacy-related inquiries, please reach out via our{' '}
              <Link href="/contact" style={{ color: 'var(--theme-primary, #ffffff)', textDecoration: 'underline' }}>Contact page</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
