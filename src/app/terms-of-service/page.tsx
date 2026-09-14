'use client';

import Link from 'next/link';

export default function TermsOfServicePage() {
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
        <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 40, fontSize: 'var(--text-sm)' }}>
          Last updated: September 14, 2026
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <section>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 12 }}>1. Acceptance of Terms</h2>
            <p style={{ lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
              By accessing or using IPL Auction Arena (&quot;the Platform&quot;), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use the Platform. We reserve the right to update these
              terms at any time, and your continued use constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 12 }}>2. Account Registration</h2>
            <ul style={{ paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              <li>You must provide accurate and complete information when creating an account.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must be at least 13 years of age to create an account.</li>
              <li>One account per individual is permitted. Duplicate accounts may be suspended.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 12 }}>3. Service Tiers</h2>
            <p style={{ lineHeight: 1.7, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
              IPL Auction Arena offers the following subscription tiers:
            </p>
            <ul style={{ paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              <li><strong>Free:</strong> Basic player stats, comparisons, and featured matchups.</li>
              <li><strong>Pro (₹999/year):</strong> AI predictions, team comparisons, Digital Twin simulator, and live auction viewer.</li>
              <li><strong>Business:</strong> Franchise management tools, auctioneer console, and custom AI models. Contact for pricing.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 12 }}>4. Payments & Refunds</h2>
            <p style={{ lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
              All payments are processed securely via Razorpay. Pro subscriptions are billed annually at ₹999.
              Refunds may be requested within 7 days of purchase if you have not extensively used Pro features.
              Business tier pricing is determined on a case-by-case basis.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 12 }}>5. Acceptable Use</h2>
            <p style={{ lineHeight: 1.7, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
              You agree not to:
            </p>
            <ul style={{ paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              <li>Use automated bots or scrapers to extract data from the Platform.</li>
              <li>Attempt to gain unauthorized access to admin or auctioneer features.</li>
              <li>Disrupt live auction sessions or manipulate bidding processes.</li>
              <li>Share your account credentials with others or resell access.</li>
              <li>Use the Platform for any illegal or unauthorized purpose.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 12 }}>6. AI Predictions Disclaimer</h2>
            <p style={{ lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
              AI-generated predictions, player scores, and comparison verdicts are based on historical IPL data and
              machine learning models. They are provided for informational and entertainment purposes only.
              IPL Auction Arena makes no guarantee of prediction accuracy and is not liable for decisions made
              based on AI-generated insights.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 12 }}>7. Intellectual Property</h2>
            <p style={{ lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
              All content, designs, AI models, and features on IPL Auction Arena are the intellectual property
              of IPL Auction Arena. IPL team names, logos, and related trademarks belong to their respective owners
              and are used for fan-engagement purposes under fair use.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 12 }}>8. Account Termination</h2>
            <p style={{ lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
              We reserve the right to suspend or terminate accounts that violate these terms. You may delete
              your account at any time from the Account Details page, which will permanently remove all your data.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 12 }}>9. Limitation of Liability</h2>
            <p style={{ lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
              IPL Auction Arena is provided &quot;as is&quot; without warranties of any kind. We are not liable for any
              damages arising from your use of the Platform, including but not limited to data loss, service
              interruptions, or inaccurate AI predictions.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 12 }}>10. Contact</h2>
            <p style={{ lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
              For questions about these Terms of Service, please reach out via our{' '}
              <Link href="/contact" style={{ color: 'var(--theme-primary, #ffffff)', textDecoration: 'underline' }}>Contact page</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
