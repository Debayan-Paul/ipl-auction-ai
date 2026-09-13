'use client';

import { useState } from 'react';

export default function AdminAIPage() {
  const [retraining, setRetraining] = useState(false);
  const [matchStatus, setMatchStatus] = useState('upcoming');

  const handleRetrain = () => { setRetraining(true); setTimeout(() => setRetraining(false), 4000); };

  const predictionYear = matchStatus === 'completed' ? 2028 : 2027;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ marginBottom: 'var(--space-2)' }}>🧠 AI Model Control</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Manage prediction models, control prediction year, and trigger retraining.</p>
      </div>

      {/* Season & Prediction Control */}
      <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>🗓️ Prediction Year Control</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-6)', alignItems: 'end' }}>
          <div className="input-group">
            <label className="input-label">Match Status (Admin Only)</label>
            <select value={matchStatus} onChange={(e) => setMatchStatus(e.target.value)} className="input">
              <option value="upcoming">Upcoming</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="theme-card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-1)' }}>AI Predicting For</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-extrabold)', color: 'var(--theme-primary)' }}>IPL {predictionYear}</div>
          </div>
          <div className="theme-card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-1)' }}>Logic</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              {matchStatus === 'completed' ? 'Match ended → predicting next year' : 'Match upcoming/ongoing → predicting current year'}
            </div>
          </div>
        </div>
      </div>

      {/* Global Model */}
      <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>🌍 Global AI Model</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          {[
            { label: 'Model Version', value: 'v2.4.1', icon: '📦' },
            { label: 'Training Data', value: '2008-2026', icon: '📊' },
            { label: 'Accuracy (MAE)', value: '±12.3 runs', icon: '🎯' },
            { label: 'Last Trained', value: '3 days ago', icon: '🕐' },
          ].map((m) => (
            <div key={m.label} className="theme-card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-1)' }}>{m.icon}</div>
              <div style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-base)' }}>{m.value}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{m.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-primary" onClick={handleRetrain} disabled={retraining}>
            {retraining ? '🔄 Retraining...' : '🧠 Retrain Global Model'}
          </button>
          <button className="btn btn-secondary">📊 View Metrics</button>
          {matchStatus === 'completed' && (
            <button className="btn btn-danger">🌐 Update Global Model for Everyone</button>
          )}
        </div>

        {retraining && (
          <div style={{ marginTop: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-1)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Training progress...</span>
              <span style={{ color: 'var(--color-info)' }}>Processing</span>
            </div>
            <div style={{ height: 6, background: 'var(--color-surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '60%', background: 'var(--color-info)', borderRadius: 'var(--radius-full)', animation: 'shimmer 1.5s ease-in-out infinite', backgroundSize: '200% 100%' }} />
            </div>
          </div>
        )}
      </div>

      {/* Team Models */}
      <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>🏏 Team-Specific Models</h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
          Franchise-scoped models trained with manager-fed custom data. Only visible to that franchise.
        </p>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Team</th><th>Model Version</th><th>Custom Data Points</th><th>Status</th><th>Last Trained</th></tr></thead>
            <tbody>
              {[
                { team: 'CSK', version: 'v1.2', points: 45, status: 'active', lastTrained: '1 day ago' },
                { team: 'MI', version: 'v1.1', points: 32, status: 'active', lastTrained: '3 days ago' },
                { team: 'RCB', version: '-', points: 0, status: 'not trained', lastTrained: '-' },
              ].map((m) => (
                <tr key={m.team}>
                  <td style={{ fontWeight: 'var(--weight-semibold)' }}>{m.team}</td>
                  <td>{m.version}</td>
                  <td>{m.points}</td>
                  <td><span className={`badge ${m.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{m.status}</span></td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{m.lastTrained}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
