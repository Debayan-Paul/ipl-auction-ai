'use client';

import { useState } from 'react';

export default function AdminDataPage() {
  const [uploading, setUploading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [dataSource, setDataSource] = useState<'scraped' | 'manual'>('scraped');

  const handleUpload = () => { setUploading(true); setTimeout(() => setUploading(false), 2000); };
  const handleScrape = () => { setScraping(true); setTimeout(() => setScraping(false), 3000); };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ marginBottom: 'var(--space-2)' }}>📂 Data Management</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Upload data manually, trigger scraping, or edit player records.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        {/* Upload CSV */}
        <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>📤 Upload Data</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
            Upload CSV or XLSX files to bulk-update player stats, auction data, or team rosters.
          </p>
          <div style={{
            border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-8)',
            textAlign: 'center', cursor: 'pointer', transition: 'border-color var(--transition-fast)',
          }}>
            <div style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>📁</div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Drag & drop CSV/XLSX files here, or click to browse
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleUpload} disabled={uploading} style={{ marginTop: 'var(--space-4)', width: '100%' }}>
            {uploading ? '⏳ Processing...' : '📤 Upload & Process'}
          </button>
        </div>

        {/* Scraping */}
        <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>🌐 Data Scraping</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
            Scrape latest player stats and match data from cricket data sources.
          </p>

          <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="input-label">Data Source Preference</label>
            <select value={dataSource} onChange={(e) => setDataSource(e.target.value as 'scraped' | 'manual')} className="input">
              <option value="scraped">Use Scraped Data</option>
              <option value="manual">Use Manual Data</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <div className="theme-card" style={{ flex: 1, padding: 'var(--space-3)', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Last Scraped</div>
              <div style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)' }}>2 days ago</div>
            </div>
            <div className="theme-card" style={{ flex: 1, padding: 'var(--space-3)', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Records</div>
              <div style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)' }}>524 players</div>
            </div>
          </div>

          <button className="btn btn-secondary" onClick={handleScrape} disabled={scraping} style={{ width: '100%' }}>
            {scraping ? '🔄 Scraping...' : '🌐 Trigger Scrape'}
          </button>
        </div>
      </div>

      {/* Inline Editor placeholder */}
      <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>✏️ Inline Player Editor</h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
          Edit individual player records. Changes are tracked with version history.
        </p>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Player</th><th>Role</th><th>Matches</th><th>Runs</th><th>Wickets</th><th>Source</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {[
                { name: 'Virat Kohli', role: 'Batsman', matches: 237, runs: 7263, wickets: 4, source: 'scraped' },
                { name: 'Jasprit Bumrah', role: 'Bowler', matches: 120, runs: 56, wickets: 145, source: 'scraped' },
                { name: 'MS Dhoni', role: 'WK', matches: 264, runs: 5243, wickets: 0, source: 'manual' },
              ].map((p) => (
                <tr key={p.name}>
                  <td style={{ fontWeight: 'var(--weight-medium)' }}>{p.name}</td>
                  <td><span className={`badge ${p.role === 'Bowler' ? 'badge-bowling' : p.role === 'WK' ? 'badge-keeper' : 'badge-batting'}`}>{p.role}</span></td>
                  <td>{p.matches}</td><td>{p.runs.toLocaleString()}</td><td>{p.wickets}</td>
                  <td><span className={`badge ${p.source === 'scraped' ? 'badge-primary' : 'badge-warning'}`}>{p.source}</span></td>
                  <td><button className="btn btn-ghost btn-sm">✏️ Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
