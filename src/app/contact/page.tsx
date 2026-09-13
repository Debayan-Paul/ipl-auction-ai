'use client';

import Link from 'next/link';
import styles from '../landing.module.css';

export default function ContactPage() {
  return (
    <div className={styles.landing}>
      <nav className={styles.navbar}>
        <Link href="/" className={styles['nav-logo']}>
          <div className={styles['nav-logo-icon']}>🏏</div>
          <div className={styles['nav-logo-text']}>IPL <span>Auction Arena</span></div>
        </Link>
        <ul className={styles['nav-links']}>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/features">Features</Link></li>
          <li><Link href="/stats">Player Stats</Link></li>
        </ul>
        <div className={styles['nav-actions']}>
          <Link href="/login" className="btn btn-ghost">Sign In</Link>
          <Link href="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      <section className={styles.hero} style={{ minHeight: '60vh' }}>
        <div className={styles['hero-bg']}>
          <div className={`${styles['hero-gradient-orb']} ${styles['hero-orb-1']}`} />
          <div className={`${styles['hero-gradient-orb']} ${styles['hero-orb-2']}`} />
          <div className={styles['hero-grid']} />
        </div>
        <div className={styles['hero-content']}>
          <h1>Get in <span className="gradient-text">Touch</span></h1>
          <p className={styles['hero-subtitle']}>
            Interested in Business tier access for your IPL franchise? Have questions? Reach out to us.
          </p>
        </div>
      </section>

      <section style={{ padding: 'var(--space-16) var(--space-8)', maxWidth: 800, margin: '0 auto' }}>
        <div className="glass-card" style={{ padding: 'var(--space-8)' }}>
          <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
              <div className="input-group">
                <label className="input-label" htmlFor="name">Full Name</label>
                <input id="name" type="text" className="input" placeholder="Your name" />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="email">Email</label>
                <input id="email" type="email" className="input" placeholder="you@example.com" />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="subject">Subject</label>
              <select id="subject" className="input">
                <option>Business Tier Inquiry</option>
                <option>General Question</option>
                <option>Bug Report</option>
                <option>Feature Request</option>
                <option>Partnership</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="message">Message</label>
              <textarea id="message" className="input" rows={6} placeholder="Tell us how we can help..." style={{ resize: 'vertical' }} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              📧 Send Message
            </button>
          </form>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles['footer-bottom']}>
          <p>© {new Date().getFullYear()} IPL Auction Arena. Built with 🏏 for cricket.</p>
        </div>
      </footer>
    </div>
  );
}
