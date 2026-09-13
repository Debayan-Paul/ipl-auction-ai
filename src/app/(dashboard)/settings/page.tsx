'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [purseLimit, setPurseLimit] = useState(120);
  const [overseasCap, setOverseasCap] = useState(8);
  const [riskTolerance, setRiskTolerance] = useState(50);
  const [strategyFocus, setStrategyFocus] = useState('balanced');
  const [monteCarloIterations, setMonteCarloIterations] = useState(1000);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', maxWidth: 800 }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ marginBottom: 'var(--space-2)' }}>⚙️ Settings</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Configure auction rules and AI engine parameters.</p>
      </div>

      {/* Auction Rules */}
      <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-5)' }}>🏏 Auction Rules</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
          <div className="input-group">
            <label className="input-label">Purse Limit (₹ Crores)</label>
            <input type="number" className="input" value={purseLimit} onChange={(e) => setPurseLimit(Number(e.target.value))} />
          </div>
          <div className="input-group">
            <label className="input-label">Max Overseas Players</label>
            <input type="number" className="input" value={overseasCap} onChange={(e) => setOverseasCap(Number(e.target.value))} />
          </div>
        </div>
      </div>

      {/* AI Engine Parameters */}
      <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-5)' }}>🤖 AI Engine Parameters</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="input-group">
            <label className="input-label">Risk Tolerance: {riskTolerance}%</label>
            <input type="range" min={0} max={100} value={riskTolerance} onChange={(e) => setRiskTolerance(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--theme-primary)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              <span>Conservative</span><span>Aggressive</span>
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Strategy Focus</label>
            <select value={strategyFocus} onChange={(e) => setStrategyFocus(e.target.value)} className="input">
              <option value="balanced">Balanced</option>
              <option value="batting">Batting Heavy</option>
              <option value="bowling">Bowling Heavy</option>
              <option value="youth">Youth Development</option>
              <option value="experience">Experienced Core</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Monte Carlo Iterations: {monteCarloIterations.toLocaleString()}</label>
            <input type="range" min={100} max={10000} step={100} value={monteCarloIterations} onChange={(e) => setMonteCarloIterations(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--theme-primary)' }} />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button className="btn btn-primary btn-lg" onClick={handleSave} style={{ width: '100%' }}>
        {saved ? '✓ Settings Saved!' : '💾 Save Settings'}
      </button>
    </div>
  );
}
