'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminPanelPage() {
  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ marginBottom: 'var(--space-2)' }}>🛡️ Admin Control Panel</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>System overview and quick actions for platform administration.</p>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        {[
          { label: 'Total Users', value: '1,247', icon: '👤', color: 'var(--theme-primary)' },
          { label: 'Pro Subscribers', value: '89', icon: '⭐', color: 'var(--color-batting)' },
          { label: 'Active Sessions', value: '34', icon: '🟢', color: 'var(--color-success)' },
          { label: 'Revenue (YTD)', value: '₹88,911', icon: '💰', color: 'var(--color-allround)' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card" style={{ padding: 'var(--space-5)', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>{stat.icon}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-extrabold)', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Season Control */}
      <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>🗓️ Season & Auction Phase Control</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
          <div className="input-group">
            <label className="input-label">Current Season</label>
            <select className="input" defaultValue="2027"><option value="2026">IPL 2026</option><option value="2027">IPL 2027</option></select>
          </div>
          <div className="input-group">
            <label className="input-label">Match Status</label>
            <select className="input" defaultValue="upcoming"><option value="upcoming">Upcoming</option><option value="in_progress">In Progress</option><option value="completed">Completed</option></select>
          </div>
          <div className="input-group">
            <label className="input-label">Auction Phase</label>
            <select className="input" defaultValue="before"><option value="before">Before Auction</option><option value="during">During Auction</option><option value="after">After Auction</option></select>
          </div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>💾 Update Season Control</button>
      </div>

      {/* Quick Navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)' }}>
        {[
          { href: '/admin/features', icon: '🎛️', title: 'Feature Flags', desc: 'Toggle feature visibility per auction phase' },
          { href: '/admin/data', icon: '📂', title: 'Data Management', desc: 'Upload, scrape, and manage player data' },
          { href: '/admin/users', icon: '👥', title: 'User Management', desc: 'Manage roles (Managers, Auctioneers) and team assignments' },
          { href: '/admin/ai', icon: '🧠', title: 'AI Model Control', desc: 'Retrain models, control predictions' },
          { href: '/admin/features', icon: '💳', title: 'Payments', desc: 'View Razorpay transactions, manage subscriptions' },
        ].map((card) => (
          <Link key={card.href + card.title} href={card.href} className="glass-card" style={{ padding: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: 'var(--text-3xl)' }}>{card.icon}</div>
            <div>
              <div style={{ fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-1)' }}>{card.title}</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{card.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
