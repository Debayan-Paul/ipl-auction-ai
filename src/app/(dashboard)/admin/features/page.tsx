'use client';

import { useState } from 'react';

interface Flag {
  key: string;
  label: string;
  before: boolean;
  during: boolean;
  after: boolean;
}

const DEFAULT_FLAGS: Flag[] = [
  { key: 'player_stats', label: 'Player Stats (Historical)', before: true, during: true, after: true },
  { key: 'ai_predictions', label: 'AI Predictions', before: true, during: false, after: true },
  { key: 'player_comparison', label: 'Player Comparison', before: true, during: false, after: true },
  { key: 'team_vs_team', label: 'Team vs Team', before: true, during: false, after: true },
  { key: 'live_auction_viewer', label: 'Live Auction Viewer', before: false, during: true, after: false },
  { key: 'auctioneer_console', label: 'Auctioneer Console', before: false, during: true, after: false },
  { key: 'manager_bidding', label: 'Manager Bidding', before: false, during: true, after: false },
  { key: 'team_builder', label: 'Team Squad Builder', before: false, during: false, after: true },
  { key: 'custom_data_feed', label: 'Custom Data Feed', before: false, during: false, after: true },
  { key: 'digital_twin', label: 'Digital Twin Simulator', before: true, during: false, after: true },
];

export default function AdminFeaturesPage() {
  const [flags, setFlags] = useState<Flag[]>(DEFAULT_FLAGS);
  const [saved, setSaved] = useState(false);

  const toggleFlag = (key: string, phase: 'before' | 'during' | 'after') => {
    setFlags(flags.map((f) => f.key === key ? { ...f, [phase]: !f[phase] } : f));
  };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ marginBottom: 'var(--space-2)' }}>🎛️ Feature Flags</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Control which features are visible to users in each auction phase.</p>
      </div>

      <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{ minWidth: 220 }}>Feature</th>
                <th style={{ textAlign: 'center' }}>🔵 Before Auction</th>
                <th style={{ textAlign: 'center' }}>🟢 During Auction</th>
                <th style={{ textAlign: 'center' }}>🟠 After Auction</th>
              </tr>
            </thead>
            <tbody>
              {flags.map((flag) => (
                <tr key={flag.key}>
                  <td style={{ fontWeight: 'var(--weight-medium)' }}>{flag.label}</td>
                  {(['before', 'during', 'after'] as const).map((phase) => (
                    <td key={phase} style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => toggleFlag(flag.key, phase)}
                        style={{
                          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative',
                          background: flag[phase] ? 'var(--color-success)' : 'var(--color-surface-active)',
                          transition: 'background var(--transition-fast)',
                        }}
                      >
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute',
                          top: 3, left: flag[phase] ? 23 : 3, transition: 'left var(--transition-fast)',
                        }} />
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: 'var(--space-6)' }}>
          {saved ? '✓ Flags Saved!' : '💾 Save Feature Flags'}
        </button>
      </div>
    </div>
  );
}
