'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './landing.module.css';

function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, hasStarted]);

  return { count, start: () => setHasStarted(true) };
}

function AnimatedCounter({ target, suffix = '', label, icon }: { target: number; suffix?: string; label: string; icon: string }) {
  const { count, start } = useCountUp(target);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) start(); },
      { threshold: 0.5 }
    );
    const el = document.getElementById(`stat-${label.replace(/\s/g, '-')}`);
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [label, start]);

  return (
    <div className={styles['stat-card']} id={`stat-${label.replace(/\s/g, '-')}`}>
      <div className={styles['stat-card-icon']}>{icon}</div>
      <div className={styles['stat-card-value']}>{count.toLocaleString()}{suffix}</div>
      <div className={styles['stat-card-label']}>{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={styles.landing}>
      {/* Navbar */}
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <Link href="/" className={styles['nav-logo']}>
          <div className={styles['nav-logo-icon']}>🏏</div>
          <div className={styles['nav-logo-text']}>
            IPL <span>Auction Arena</span>
          </div>
        </Link>

        <ul className={styles['nav-links']}>
          <li><Link href="/features">Features</Link></li>
          <li><Link href="/stats">Player Stats</Link></li>
          <li><Link href="/compare">Compare</Link></li>
          <li><Link href="#pricing">Pricing</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>

        <div className={styles['nav-actions']}>
          <Link href="/login" className="btn btn-ghost">Sign In</Link>
          <Link href="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles['hero-bg']}>
          <div className={`${styles['hero-gradient-orb']} ${styles['hero-orb-1']}`} />
          <div className={`${styles['hero-gradient-orb']} ${styles['hero-orb-2']}`} />
          <div className={`${styles['hero-gradient-orb']} ${styles['hero-orb-3']}`} />
          <div className={styles['hero-grid']} />
        </div>

        <div className={styles['hero-content']}>
          <div className={styles['hero-badge']}>
            <span className={styles['hero-badge-dot']} />
            Live Auction Season 2027 — Coming Soon
          </div>

          <h1>
            The Future of<br />
            <span className="gradient-text">IPL Auction</span> Intelligence
          </h1>

          <p className={styles['hero-subtitle']}>
            AI-powered player predictions, real-time live auctions, deep analytics,
            and franchise management tools — all in one platform built for cricket&apos;s biggest stage.
          </p>

          <div className={styles['hero-actions']}>
            <Link href="/register" className="btn btn-primary btn-lg">
              🏏 Start Free
            </Link>
            <Link href="/features" className="btn btn-secondary btn-lg">
              Explore Features →
            </Link>
          </div>

          <div className={styles['hero-stats']}>
            <div className={styles['hero-stat']}>
              <div className={styles['hero-stat-value']}>600+</div>
              <div className={styles['hero-stat-label']}>Players Analyzed</div>
            </div>
            <div className={styles['hero-stat']}>
              <div className={styles['hero-stat-value']}>17</div>
              <div className={styles['hero-stat-label']}>IPL Seasons</div>
            </div>
            <div className={styles['hero-stat']}>
              <div className={styles['hero-stat-value']}>94%</div>
              <div className={styles['hero-stat-label']}>AI Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className={styles['stats-section']}>
        <div className={styles['stats-grid']}>
          <AnimatedCounter target={524} suffix="+" label="Players Profiled" icon="👤" />
          <AnimatedCounter target={136591} suffix="" label="Deliveries Analyzed" icon="🏏" />
          <AnimatedCounter target={578} suffix="+" label="Matches Tracked" icon="🏟️" />
          <AnimatedCounter target={10} suffix="" label="IPL Franchises" icon="🏆" />
        </div>
      </section>

      {/* Features Preview */}
      <section className={styles['features-preview']}>
        <div className={styles['features-preview-header']}>
          <h2>Everything You Need for IPL</h2>
          <p>From casual stats browsing to AI-powered franchise management — we&apos;ve got every angle covered.</p>
        </div>

        <div className={styles['features-grid']}>
          <div className={styles['feature-card']}>
            <div className={styles['feature-card-icon']}>📊</div>
            <h3>Player Analytics</h3>
            <p>Deep dive into 17 years of player data. Season-by-season stats, form analysis, and performance trends.</p>
            <span className={`${styles['feature-card-tag']} ${styles['tag-free']}`}>Free</span>
          </div>

          <div className={styles['feature-card']}>
            <div className={styles['feature-card-icon']}>⚔️</div>
            <h3>Smart Comparison</h3>
            <p>Compare players with AI-generated pros, cons, and final verdict powered by Gemini. Instant scores out of 100.</p>
            <span className={`${styles['feature-card-tag']} ${styles['tag-free']}`}>Free</span>
          </div>

          <div className={styles['feature-card']}>
            <div className={styles['feature-card-icon']}>🤖</div>
            <h3>AI Predictions</h3>
            <p>XGBoost-powered performance predictions for the upcoming season. Know who&apos;ll dominate before the season starts.</p>
            <span className={`${styles['feature-card-tag']} ${styles['tag-pro']}`}>Pro</span>
          </div>

          <div className={styles['feature-card']}>
            <div className={styles['feature-card-icon']}>🏟️</div>
            <h3>Team vs Team</h3>
            <p>Complete squad strength comparison. Batting depth, bowling attack, fielding metrics — head-to-head analysis.</p>
            <span className={`${styles['feature-card-tag']} ${styles['tag-pro']}`}>Pro</span>
          </div>

          <div className={styles['feature-card']}>
            <div className={styles['feature-card-icon']}>⚡</div>
            <h3>Live Auction</h3>
            <p>Real-time auction room with sub-60ms latency. Watch or bid live with instant updates — faster than a stock exchange.</p>
            <span className={`${styles['feature-card-tag']} ${styles['tag-business']}`}>Business</span>
          </div>

          <div className={styles['feature-card']}>
            <div className={styles['feature-card-icon']}>🧠</div>
            <h3>AI Auction Coach</h3>
            <p>Get real-time bid recommendations, budget alerts, and alternative player suggestions during the live auction.</p>
            <span className={`${styles['feature-card-tag']} ${styles['tag-business']}`}>Business</span>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className={styles['pricing-section']} id="pricing">
        <div className={styles['pricing-header']}>
          <h2>Simple, Transparent Pricing</h2>
          <p className={styles['pricing-desc']}>Start free. Upgrade when you&apos;re ready for the big leagues.</p>
        </div>

        <div className={styles['pricing-grid']}>
          {/* Free */}
          <div className={styles['pricing-card']}>
            <div className={styles['pricing-tier']}>Free</div>
            <div className={styles['pricing-price']}>₹0</div>
            <p className={styles['pricing-desc']}>For casual cricket fans</p>
            <ul className={styles['pricing-features']}>
              <li>Player stats browser (600+ players)</li>
              <li>Season-by-season statistics</li>
              <li>Player comparison tool</li>
              <li>Featured comparisons</li>
              <li className="disabled">AI predictions</li>
              <li className="disabled">Team vs Team analysis</li>
              <li className="disabled">Live auction access</li>
            </ul>
            <Link href="/register" className="btn btn-secondary" style={{ width: '100%' }}>
              Get Started Free
            </Link>
          </div>

          {/* Pro */}
          <div className={`${styles['pricing-card']} ${styles.featured}`}>
            <div className={styles['pricing-tier']}>Pro</div>
            <div className={styles['pricing-price']}>₹999 <span>/ year</span></div>
            <p className={styles['pricing-desc']}>For analysts & serious fans</p>
            <ul className={styles['pricing-features']}>
              <li>Everything in Free</li>
              <li>AI-powered predictions</li>
              <li>Team vs Team comparison</li>
              <li>Digital Twin simulator</li>
              <li>Live auction viewer (read-only)</li>
              <li>Gemini AI comparison insights</li>
              <li className="disabled">Franchise bidding access</li>
            </ul>
            <Link href="/register?plan=pro" className="btn btn-primary" style={{ width: '100%' }}>
              🏏 Upgrade to Pro
            </Link>
          </div>

          {/* Business */}
          <div className={styles['pricing-card']}>
            <div className={styles['pricing-tier']}>Business</div>
            <div className={styles['pricing-price']}>Contact Us</div>
            <p className={styles['pricing-desc']}>For IPL franchise managers</p>
            <ul className={styles['pricing-features']}>
              <li>Everything in Pro</li>
              <li>Auctioneer console</li>
              <li>Manager bidding interface</li>
              <li>Team-themed dashboard</li>
              <li>Custom AI model training</li>
              <li>Auto Build XI algorithm</li>
              <li>AI Auction Coach</li>
            </ul>
            <Link href="/contact" className="btn btn-secondary" style={{ width: '100%' }}>
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles['cta-section']}>
        <div className={styles['cta-content']}>
          <h2>Ready to Dominate the Auction?</h2>
          <p>Join thousands of cricket enthusiasts and franchise scouts using AI-powered analytics.</p>
          <Link href="/register" className="btn btn-primary btn-lg">
            🏏 Get Started — It&apos;s Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles['footer-grid']}>
          <div className={styles['footer-brand']}>
            <h3>IPL <span>Auction Arena</span></h3>
            <p>The most advanced AI-powered IPL analytics and auction management platform.</p>
          </div>

          <div className={styles['footer-col']}>
            <h4>Product</h4>
            <ul>
              <li><Link href="/features">Features</Link></li>
              <li><Link href="#pricing">Pricing</Link></li>
              <li><Link href="/stats">Player Stats</Link></li>
              <li><Link href="/compare">Compare</Link></li>
            </ul>
          </div>

          <div className={styles['footer-col']}>
            <h4>Resources</h4>
            <ul>
              <li><Link href="/features">Documentation</Link></li>
              <li><Link href="/contact">API Access</Link></li>
              <li><Link href="/contact">Support</Link></li>
            </ul>
          </div>

          <div className={styles['footer-col']}>
            <h4>Legal</h4>
            <ul>
              <li><Link href="/contact">Privacy Policy</Link></li>
              <li><Link href="/contact">Terms of Service</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles['footer-bottom']}>
          <p>© {new Date().getFullYear()} IPL Auction Arena. Built with 🏏 for cricket.</p>
        </div>
      </footer>
    </div>
  );
}
