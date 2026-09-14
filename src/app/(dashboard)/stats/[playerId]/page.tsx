'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { getInitials, getRoleBadgeClass, getCountryFlag, calculateAge } from '@/lib/utils';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';

interface PlayerDetail {
  id: string;
  name: string;
  slug: string;
  country: string;
  dob: string;
  batting_hand: string;
  bowling_skill: string;
  primary_role: string;
  batting_position: string;
  origin: string;
  base_price: number | null;
  runs: number;
  matches: number;
  batting_avg: number;
  batting_sr: number;
  wickets: number;
  economy: number;
  overs_bowled: number;
  catches: number;
  fours: number;
  sixes: number;
  fifties: number;
  centuries: number;
  highest_score: number;
  seasons: {
    year: number;
    matches: number;
    runs: number;
    batting_avg: number;
    batting_sr: number;
    fours: number;
    sixes: number;
    wickets: number;
    economy: number;
    catches: number;
  }[];
}

const CHART_COLORS = { primary: '#ffd700', secondary: '#00e5ff', accent: '#ff6f00', success: '#2ea043' };

export default function PlayerProfilePage({ params }: { params: Promise<{ playerId: string }> }) {
  const { playerId } = use(params);
  const [player, setPlayer] = useState<PlayerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlayer() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/players/${playerId}`);
        if (!res.ok) {
          throw new Error('Player not found in database');
        }
        const data = await res.json();
        setPlayer(data.player);
      } catch (err: any) {
        console.error('Failed to load player details:', err);
        setError(err.message || 'Failed to load player');
      } finally {
        setLoading(false);
      }
    }
    loadPlayer();
  }, [playerId]);

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <div className="skeleton-pulse" style={{ width: 120, height: 24, margin: '0 auto var(--space-6)' }} />
        <div className="glass-card" style={{ padding: 'var(--space-12)' }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'center' }}>
            <div className="skeleton-pulse" style={{ width: 96, height: 96, borderRadius: '50%' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="skeleton-pulse" style={{ width: 240, height: 28 }} />
              <div className="skeleton-pulse" style={{ width: 160, height: 20 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
        <div style={{ fontSize: 'var(--text-5xl)', marginBottom: 'var(--space-4)' }}>🏏</div>
        <h2>Player Not Found</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
          {error || 'Unable to retrieve records for this player.'}
        </p>
        <Link href="/stats" className="btn btn-primary">
          ← Back to Players
        </Link>
      </div>
    );
  }

  const isBowler = player.primary_role === 'Bowler';
  const latestSeason = player.seasons[player.seasons.length - 1] || {
    runs: player.runs,
    batting_avg: player.batting_avg,
    batting_sr: player.batting_sr,
    wickets: player.wickets,
    matches: player.matches,
    sixes: player.sixes,
    fours: player.fours,
    catches: player.catches,
    economy: player.economy,
  };

  const radarData = [
    { stat: 'Batting', value: Math.min(100, (player.batting_avg / 45) * 100) },
    { stat: 'Power', value: Math.min(100, ((player.sixes * 2 + player.fours) / 200) * 100) },
    { stat: 'Consistency', value: Math.min(100, (player.matches / 150) * 100) },
    { stat: 'Bowling', value: Math.min(100, (player.wickets / 100) * 100) },
    { stat: 'Fielding', value: Math.min(100, (player.catches / 60) * 100) },
    { stat: 'Strike Rate', value: Math.min(100, ((player.batting_sr - 80) / 70) * 100) },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
        <Link href="/stats" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
          ← Back to Players
        </Link>
      </div>

      {/* Player Header */}
      <div className="glass-card" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 'var(--radius-full)',
              background: 'var(--theme-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--text-3xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'white',
              border: '3px solid var(--theme-card-border)',
              flexShrink: 0,
            }}
          >
            {getInitials(player.name)}
          </div>

          <div style={{ flex: 1, minWidth: 260 }}>
            <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>{player.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <span>{getCountryFlag(player.country)} {player.country}</span>
              <span className={`badge ${getRoleBadgeClass(player.primary_role as any)}`}>{player.primary_role}</span>
              {player.batting_position && player.batting_position !== 'N/A' && (
                <span className="badge badge-primary">{player.batting_position}</span>
              )}
              {player.dob && (
                <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  Age: {calculateAge(player.dob)}
                </span>
              )}
              {player.batting_hand && (
                <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  {player.batting_hand}-hand bat
                </span>
              )}
              {player.base_price && (
                <span className="badge badge-warning">
                  Base: ₹{player.base_price} Cr
                </span>
              )}
            </div>
          </div>

          {/* Career Highlights */}
          <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 'var(--weight-extrabold)',
                  color: 'var(--color-batting)',
                }}
              >
                {player.runs.toLocaleString()}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Total Runs
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 'var(--weight-extrabold)',
                  color: 'var(--color-bowling)',
                }}
              >
                {player.wickets}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Total Wickets
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 'var(--weight-extrabold)',
                  color: 'var(--theme-primary)',
                }}
              >
                {player.matches}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Matches
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      {player.seasons.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-6)',
            marginBottom: 'var(--space-8)',
          }}
        >
          {/* Performance Trend Chart */}
          <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>
              {isBowler ? '🎯 Wickets Distribution' : '🏏 Runs Distribution'}
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={player.seasons}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="year" tick={{ fill: '#8b949e', fontSize: 12 }} />
                <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: '#141b2d',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    color: '#f0f6fc',
                  }}
                />
                <Bar
                  dataKey={isBowler ? 'wickets' : 'runs'}
                  fill={isBowler ? CHART_COLORS.secondary : CHART_COLORS.primary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart */}
          <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>⚡ Career Skill Breakdown</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="stat" tick={{ fill: '#8b949e', fontSize: 11 }} />
                <PolarRadiusAxis tick={false} domain={[0, 100]} />
                <Radar
                  dataKey="value"
                  stroke={CHART_COLORS.primary}
                  fill={CHART_COLORS.primary}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Strike Rate / Economy Trend */}
      {player.seasons.length > 0 && (
        <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>
            {isBowler ? '📉 Economy Rate Trend' : '📈 Strike Rate & Average Trend'}
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={player.seasons}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" tick={{ fill: '#8b949e', fontSize: 12 }} />
              <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: '#141b2d',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  color: '#f0f6fc',
                }}
              />
              <Line
                type="monotone"
                dataKey={isBowler ? 'economy' : 'batting_sr'}
                name={isBowler ? 'Economy' : 'Strike Rate'}
                stroke={CHART_COLORS.accent}
                strokeWidth={3}
                dot={{ r: 5, fill: CHART_COLORS.accent }}
              />
              <Line
                type="monotone"
                dataKey="batting_avg"
                name="Average"
                stroke={CHART_COLORS.success}
                strokeWidth={2}
                dot={{ r: 4, fill: CHART_COLORS.success }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Season-by-Season Stats Table */}
      <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>📊 Historical IPL Statistics</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Season</th>
                <th>Matches</th>
                <th>Runs</th>
                <th>Average</th>
                <th>SR</th>
                <th>4s</th>
                <th>6s</th>
                <th>Wickets</th>
                <th>Economy</th>
                <th>Catches</th>
              </tr>
            </thead>
            <tbody>
              {player.seasons.map((s, idx) => (
                <tr key={s.year || idx}>
                  <td style={{ fontWeight: 'var(--weight-semibold)' }}>{s.year}</td>
                  <td>{s.matches}</td>
                  <td style={{ color: 'var(--color-batting)', fontWeight: 'var(--weight-semibold)' }}>
                    {s.runs.toLocaleString()}
                  </td>
                  <td>{s.batting_avg > 0 ? s.batting_avg.toFixed(2) : '—'}</td>
                  <td>{s.batting_sr > 0 ? s.batting_sr.toFixed(2) : '—'}</td>
                  <td>{s.fours}</td>
                  <td>{s.sixes}</td>
                  <td
                    style={{
                      color: s.wickets > 0 ? 'var(--color-bowling)' : 'var(--color-text-muted)',
                      fontWeight: s.wickets > 0 ? 'var(--weight-semibold)' : 'var(--weight-normal)',
                    }}
                  >
                    {s.wickets}
                  </td>
                  <td>{s.economy > 0 ? s.economy.toFixed(2) : '—'}</td>
                  <td>{s.catches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
