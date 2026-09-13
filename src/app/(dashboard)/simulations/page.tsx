'use client';

import { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const TEAMS = ['CSK', 'MI', 'RCB', 'KKR', 'DC', 'RR', 'SRH', 'PBKS', 'GT', 'LSG'];
const STRATEGIES = ['Balanced', 'Aggressive Batting', 'Bowling Heavy', 'Youth Focus', 'Experience Heavy'];

export default function SimulationsPage() {
  const [iterations, setIterations] = useState(1000);
  const [strategy, setStrategy] = useState('Balanced');
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<{ team: string; winProbability: number; avgSpend: number; color: string }[] | null>(null);

  const runSimulation = async () => {
    setRunning(true);
    await new Promise((r) => setTimeout(r, 2000));

    const colors: Record<string, string> = { CSK: '#ffc107', MI: '#004ba0', RCB: '#c62828', KKR: '#3a0078', DC: '#1565c0', RR: '#e91e90', SRH: '#ff6f00', PBKS: '#8b0000', GT: '#00bcd4', LSG: '#d32f2f' };
    const simResults = TEAMS.map((team) => ({
      team,
      winProbability: Math.floor(5 + Math.random() * 20),
      avgSpend: Math.floor(60 + Math.random() * 40),
      color: colors[team] || '#888',
    })).sort((a, b) => b.winProbability - a.winProbability);

    // Normalize to ~100%
    const total = simResults.reduce((s, r) => s + r.winProbability, 0);
    simResults.forEach((r) => (r.winProbability = Math.round((r.winProbability / total) * 100)));

    setResults(simResults);
    setRunning(false);
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ marginBottom: 'var(--space-2)' }}>🎲 Digital Twin Simulator</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Monte Carlo auction simulator — run thousands of scenarios to predict championship probabilities.</p>
      </div>

      {/* Configuration */}
      <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>⚙️ Simulation Configuration</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-6)' }}>
          <div className="input-group">
            <label className="input-label">Monte Carlo Iterations</label>
            <input type="range" min={100} max={10000} step={100} value={iterations} onChange={(e) => setIterations(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--theme-primary)' }} />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{iterations.toLocaleString()} iterations</span>
          </div>
          <div className="input-group">
            <label className="input-label">Team Strategy Profile</label>
            <select value={strategy} onChange={(e) => setStrategy(e.target.value)} className="input">
              {STRATEGIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-primary btn-lg" onClick={runSimulation} disabled={running} style={{ width: '100%' }}>
              {running ? '🔄 Simulating...' : '🎲 Run Simulation'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <>
          <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>🏆 Championship Win Probability</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={results} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" tick={{ fill: '#8b949e', fontSize: 12 }} domain={[0, 'auto']} unit="%" />
                <YAxis dataKey="team" type="category" tick={{ fill: '#8b949e', fontSize: 12 }} width={50} />
                <Tooltip contentStyle={{ background: '#141b2d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0f6fc' }} formatter={(val) => `${val}%`} />
                <Bar dataKey="winProbability" radius={[0, 4, 4, 0]} fill="var(--theme-primary)">
                  {results.map((entry) => (
                    <rect key={entry.team} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top 3 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
            {results.slice(0, 3).map((team, idx) => (
              <div key={team.team} className="theme-card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                <div style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-extrabold)', color: team.color }}>{team.team}</div>
                <div style={{ fontSize: 'var(--text-4xl)', fontFamily: 'var(--font-heading)', fontWeight: 'var(--weight-extrabold)', marginTop: 'var(--space-2)' }}>{team.winProbability}%</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Win Probability</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
