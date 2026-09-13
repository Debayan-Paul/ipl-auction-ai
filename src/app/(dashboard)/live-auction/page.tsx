'use client';

export default function LiveAuctionPage() {
  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ marginBottom: 'var(--space-2)' }}>📺 Live Auction Viewer</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Watch the IPL auction unfold in real-time. Pro users get read-only access to live bidding.</p>
      </div>

      {/* Status Card */}
      <div className="glass-card" style={{ padding: 'var(--space-12)', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ fontSize: 'var(--text-6xl)', marginBottom: 'var(--space-4)' }}>🏏</div>
        <h3 style={{ marginBottom: 'var(--space-3)' }}>No Live Auction</h3>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)', maxWidth: 400, margin: '0 auto var(--space-6)' }}>
          The next IPL Auction is scheduled once a year before the IPL season. When a live auction is in progress, you&apos;ll see real-time bids, player lots, and team budgets here.
        </p>

        <div className="theme-card" style={{ padding: 'var(--space-4)', display: 'inline-block' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-1)' }}>Auction Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-warning)', animation: 'pulse 2s ease-in-out infinite' }} />
            <span style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-warning)' }}>Awaiting Schedule</span>
          </div>
        </div>

        {/* What to expect */}
        <div style={{ marginTop: 'var(--space-8)', textAlign: 'left' }}>
          <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-lg)' }}>What you&apos;ll see during a live auction:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            {[
              { icon: '🎯', text: 'Current player under the hammer' },
              { icon: '💰', text: 'Live bid amounts & highest bidder' },
              { icon: '⏱️', text: 'Bid timer countdown' },
              { icon: '📊', text: 'Team budget tracker' },
              { icon: '✅', text: 'Sold players feed with prices' },
              { icon: '🏆', text: 'Real-time squad composition' },
            ].map((item) => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', padding: 'var(--space-2)' }}>
                <span>{item.icon}</span> {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
