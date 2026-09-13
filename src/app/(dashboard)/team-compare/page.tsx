'use client';

import { useState } from 'react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

const TEAMS = [
  { code: 'CSK', name: 'Chennai Super Kings', color: '#ffc107' },
  { code: 'MI', name: 'Mumbai Indians', color: '#004ba0' },
  { code: 'RCB', name: 'Royal Challengers Bengaluru', color: '#c62828' },
  { code: 'KKR', name: 'Kolkata Knight Riders', color: '#3a0078' },
  { code: 'DC', name: 'Delhi Capitals', color: '#004ba0' },
  { code: 'RR', name: 'Rajasthan Royals', color: '#e91e90' },
  { code: 'SRH', name: 'Sunrisers Hyderabad', color: '#ff6f00' },
  { code: 'PBKS', name: 'Punjab Kings', color: '#8b0000' },
  { code: 'GT', name: 'Gujarat Titans', color: '#00bcd4' },
  { code: 'LSG', name: 'Lucknow Super Giants', color: '#d32f2f' },
];

function getTeamStats(code: string) {
  const seed = code.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const r = (min: number, max: number) => min + ((seed * 13 + max) % (max - min));
  return {
    batting: r(55, 90), bowling: r(50, 88), fielding: r(55, 85), experience: r(50, 92), youth: r(40, 80), depth: r(50, 85),
    totalRuns: r(2000, 3500), totalWickets: r(60, 100), winRate: r(40, 72), avgScore: r(155, 195),
    topBatter: `Player ${r(1, 9)}`, topBowler: `Player ${r(10, 18)}`,
  };
}

export default function TeamComparePage() {
  const [teamA, setTeamA] = useState('CSK');
  const [teamB, setTeamB] = useState('MI');

  const statsA = getTeamStats(teamA);
  const statsB = getTeamStats(teamB);
  const teamAInfo = TEAMS.find((t) => t.code === teamA)!;
  const teamBInfo = TEAMS.find((t) => t.code === teamB)!;

  const radarData = [
    { dimension: 'Batting', [teamA]: statsA.batting, [teamB]: statsB.batting },
    { dimension: 'Bowling', [teamA]: statsA.bowling, [teamB]: statsB.bowling },
    { dimension: 'Fielding', [teamA]: statsA.fielding, [teamB]: statsB.fielding },
    { dimension: 'Experience', [teamA]: statsA.experience, [teamB]: statsB.experience },
    { dimension: 'Youth', [teamA]: statsA.youth, [teamB]: statsB.youth },
    { dimension: 'Depth', [teamA]: statsA.depth, [teamB]: statsB.depth },
  ];

  const barData = [
    { metric: 'Runs', [teamA]: statsA.totalRuns, [teamB]: statsB.totalRuns },
    { metric: 'Wickets', [teamA]: statsA.totalWickets * 30, [teamB]: statsB.totalWickets * 30 },
    { metric: 'Avg Score', [teamA]: statsA.avgScore * 15, [teamB]: statsB.avgScore * 15 },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ marginBottom: 'var(--space-2)' }}>🏟️ Team vs Team</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Compare squad strength across multiple dimensions. Uses previous year data before auction.</p>
      </div>

      {/* Team Selectors */}
      <div style={{ display: 'flex', gap: 'var(--space-6)', marginBottom: 'var(--space-8)', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ padding: 'var(--space-4)', minWidth: 200, textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase' }}>Team A</div>
          <select value={teamA} onChange={(e) => setTeamA(e.target.value)} className="input" style={{ textAlign: 'center', fontWeight: 'var(--weight-semibold)' }}>
            {TEAMS.map((t) => <option key={t.code} value={t.code}>{t.name}</option>)}
          </select>
        </div>

        <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-heading)' }}>VS</div>

        <div className="glass-card" style={{ padding: 'var(--space-4)', minWidth: 200, textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase' }}>Team B</div>
          <select value={teamB} onChange={(e) => setTeamB(e.target.value)} className="input" style={{ textAlign: 'center', fontWeight: 'var(--weight-semibold)' }}>
            {TEAMS.map((t) => <option key={t.code} value={t.code}>{t.name}</option>)}
          </select>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        {/* Radar Comparison */}
        <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>⚡ Squad Strength Radar</h3>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#8b949e', fontSize: 12 }} />
              <PolarRadiusAxis tick={false} domain={[0, 100]} />
              <Radar name={teamAInfo.name} dataKey={teamA} stroke={teamAInfo.color} fill={teamAInfo.color} fillOpacity={0.2} strokeWidth={2} />
              <Radar name={teamBInfo.name} dataKey={teamB} stroke={teamBInfo.color} fill={teamBInfo.color} fillOpacity={0.2} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#8b949e' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Comparison */}
        <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>📊 Performance Metrics</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="metric" tick={{ fill: '#8b949e', fontSize: 12 }} />
              <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#141b2d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0f6fc' }} />
              <Bar dataKey={teamA} fill={teamAInfo.color} radius={[4, 4, 0, 0]} />
              <Bar dataKey={teamB} fill={teamBInfo.color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Head-to-Head Stats */}
      <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-6)' }}>📋 Head-to-Head Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 'var(--space-6)' }}>
          {[
            { label: 'Win Rate', a: `${statsA.winRate}%`, b: `${statsB.winRate}%`, aBetter: statsA.winRate > statsB.winRate },
            { label: 'Avg Score', a: statsA.avgScore.toString(), b: statsB.avgScore.toString(), aBetter: statsA.avgScore > statsB.avgScore },
            { label: 'Total Runs', a: statsA.totalRuns.toLocaleString(), b: statsB.totalRuns.toLocaleString(), aBetter: statsA.totalRuns > statsB.totalRuns },
            { label: 'Total Wickets', a: statsA.totalWickets.toString(), b: statsB.totalWickets.toString(), aBetter: statsA.totalWickets > statsB.totalWickets },
          ].map((stat) => (
            <div key={stat.label} style={{ display: 'contents' }}>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: stat.aBetter ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
                {stat.a} {stat.aBetter && '✓'}
              </div>
              <div style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', alignSelf: 'center', minWidth: 100 }}>{stat.label}</div>
              <div style={{ textAlign: 'left', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: !stat.aBetter ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
                {!stat.aBetter && '✓ '}{stat.b}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
