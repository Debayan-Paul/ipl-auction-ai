'use client';

import Link from 'next/link';
import styles from '../landing.module.css';

const FEATURES = [
  {
    category: 'Analytics & Stats',
    tier: 'free',
    items: [
      {
        icon: '📊',
        title: 'Player Stats Browser',
        description: 'Browse 600+ IPL players with detailed career statistics. Filter by role, team, country, and season. View batting averages, strike rates, economy rates, and 20+ metrics.',
      },
      {
        icon: '📈',
        title: 'Season Trend Charts',
        description: 'Interactive charts showing performance trends over 17 IPL seasons. Track form, consistency, and peak performance years with Recharts visualizations.',
      },
      {
        icon: '⚔️',
        title: 'Smart Player Comparison',
        description: 'Compare any 2+ players side-by-side with radar charts, stat tables, and AI-generated insights. Fuzzy search with autocomplete — find players in seconds.',
      },
      {
        icon: '🤖',
        title: 'Gemini AI Verdict',
        description: 'Every comparison includes Gemini-powered pros, cons, final verdict, and a score out of 100 for each player. Get instant expert analysis.',
      },
      {
        icon: '⭐',
        title: 'Featured Comparisons',
        description: 'Curated popular matchups like Kohli vs Rohit, Bumrah vs Archer. One-click access to the most debated player face-offs.',
      },
    ],
  },
  {
    category: 'AI Predictions',
    tier: 'pro',
    items: [
      {
        icon: '🧠',
        title: 'Performance Predictions',
        description: 'XGBoost-powered predictions for the upcoming season. Predicted runs, wickets, averages, and strike rates with confidence intervals.',
      },
      {
        icon: '🏟️',
        title: 'Team vs Team Analysis',
        description: 'Head-to-head squad strength comparison. Batting depth, bowling attack, fielding metrics, experience, and youth scores across dimensions.',
      },
      {
        icon: '🎲',
        title: 'Digital Twin Simulator',
        description: 'Monte Carlo auction simulator with AI agents per team. Run thousands of scenarios to see probability distributions and championship odds.',
      },
      {
        icon: '📺',
        title: 'Live Auction Viewer',
        description: 'Watch the live auction in real-time. See current bids, sold players, team budgets — all updating live with sub-60ms latency.',
      },
      {
        icon: '⚙️',
        title: 'Configuration & Settings',
        description: 'Customize AI engine parameters, risk tolerance, strategy focus, and Monte Carlo iterations. Fine-tune the analytics to your style.',
      },
    ],
  },
  {
    category: 'Franchise Management',
    tier: 'business',
    items: [
      {
        icon: '🔨',
        title: 'Auctioneer Console',
        description: 'Full auction control — create rooms, generate tokens, set budgets, manage player lots, confirm sales, and lock players. Command-center dashboard.',
      },
      {
        icon: '💰',
        title: 'Manager Bidding Interface',
        description: 'Real-time bidding with team-themed UI. Place bids, track budget, view shortlist — all with less than 60ms response time.',
      },
      {
        icon: '🎨',
        title: 'Dynamic Team Theming',
        description: 'Your entire dashboard transforms to match your franchise colors. CSK yellow, MI blue, RCB red — immersive team identity experience.',
      },
      {
        icon: '📋',
        title: 'Auto Build XI',
        description: 'AI-powered optimal XI selection from your squad. Considers role balance, batting order, bowling combinations, and synergy metrics.',
      },
      {
        icon: '🔬',
        title: 'Custom AI Model',
        description: 'Feed your own scouting data to train a franchise-specific prediction model. Your insights stay private — only visible to your team.',
      },
      {
        icon: '🎯',
        title: 'AI Auction Coach',
        description: 'Real-time bid recommendations during live auction. Budget safety alerts, alternative player suggestions, and win probability calculators.',
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className={styles.landing}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <Link href="/" className={styles['nav-logo']}>
          <div className={styles['nav-logo-icon']}>🏏</div>
          <div className={styles['nav-logo-text']}>IPL <span>Auction Arena</span></div>
        </Link>
        <ul className={styles['nav-links']}>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/features" style={{ color: 'var(--color-text-primary)' }}>Features</Link></li>
          <li><Link href="/stats">Player Stats</Link></li>
          <li><Link href="#pricing">Pricing</Link></li>
        </ul>
        <div className={styles['nav-actions']}>
          <Link href="/login" className="btn btn-ghost">Sign In</Link>
          <Link href="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero} style={{ minHeight: '60vh' }}>
        <div className={styles['hero-bg']}>
          <div className={`${styles['hero-gradient-orb']} ${styles['hero-orb-1']}`} />
          <div className={`${styles['hero-gradient-orb']} ${styles['hero-orb-2']}`} />
          <div className={styles['hero-grid']} />
        </div>
        <div className={styles['hero-content']}>
          <h1>
            Every Feature,<br />
            <span className="gradient-text">One Platform</span>
          </h1>
          <p className={styles['hero-subtitle']}>
            From casual stat browsing to AI-powered franchise management —
            explore every tool built for cricket&apos;s biggest stage.
          </p>
        </div>
      </section>

      {/* Feature Categories */}
      {FEATURES.map((category) => (
        <section key={category.category} className={styles['features-preview']} style={{ paddingTop: 'var(--space-12)' }}>
          <div className={styles['features-preview-header']}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <h2>{category.category}</h2>
              <span
                className={`${styles['feature-card-tag']} ${
                  category.tier === 'free' ? styles['tag-free'] :
                  category.tier === 'pro' ? styles['tag-pro'] :
                  styles['tag-business']
                }`}
                style={{ fontSize: 'var(--text-sm)' }}
              >
                {category.tier}
              </span>
            </div>
          </div>

          <div className={styles['features-grid']}>
            {category.items.map((feature) => (
              <div key={feature.title} className={styles['feature-card']}>
                <div className={styles['feature-card-icon']}>{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className={styles['cta-section']}>
        <div className={styles['cta-content']}>
          <h2>Start Exploring Now</h2>
          <p>Player stats and comparisons are completely free. No credit card required.</p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary btn-lg">🏏 Start Free</Link>
            <Link href="/#pricing" className="btn btn-secondary btn-lg">View Pricing</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles['footer-bottom']}>
          <p>© {new Date().getFullYear()} IPL Auction Arena. Built with 🏏 for cricket.</p>
        </div>
      </footer>
    </div>
  );
}
