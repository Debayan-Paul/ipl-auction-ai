'use client';

import { use } from 'react';
import Link from 'next/link';
import { getInitials, getRoleBadgeClass, getCountryFlag, calculateAge } from '@/lib/utils';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';

// Demo data — in production comes from Supabase
const PLAYERS: Record<string, {
  id: string; name: string; country: string; dob: string; batting_hand: string; bowling_skill: string;
  primary_role: string; batting_position: string; origin: string;
  seasons: { year: number; matches: number; runs: number; batting_avg: number; batting_sr: number; fours: number; sixes: number; wickets: number; economy: number; catches: number }[];
}> = {
  '1': {
    id: '1', name: 'Virat Kohli', country: 'India', dob: '1988-11-05', batting_hand: 'Right', bowling_skill: 'Right-arm medium',
    primary_role: 'Batsman', batting_position: 'Middle-Order', origin: 'Indian',
    seasons: [
      { year: 2016, matches: 16, runs: 973, batting_avg: 81.08, batting_sr: 152.03, fours: 83, sixes: 38, wickets: 0, economy: 0, catches: 10 },
      { year: 2017, matches: 10, runs: 308, batting_avg: 30.80, batting_sr: 122.22, fours: 28, sixes: 6, wickets: 0, economy: 0, catches: 5 },
      { year: 2018, matches: 14, runs: 530, batting_avg: 48.18, batting_sr: 141.33, fours: 46, sixes: 18, wickets: 0, economy: 0, catches: 9 },
      { year: 2019, matches: 14, runs: 464, batting_avg: 33.14, batting_sr: 141.46, fours: 40, sixes: 14, wickets: 0, economy: 0, catches: 8 },
      { year: 2020, matches: 14, runs: 466, batting_avg: 42.36, batting_sr: 121.35, fours: 30, sixes: 11, wickets: 0, economy: 0, catches: 6 },
      { year: 2021, matches: 15, runs: 405, batting_avg: 28.92, batting_sr: 119.82, fours: 31, sixes: 10, wickets: 0, economy: 0, catches: 7 },
      { year: 2022, matches: 16, runs: 341, batting_avg: 22.73, batting_sr: 115.98, fours: 22, sixes: 8, wickets: 0, economy: 0, catches: 10 },
      { year: 2023, matches: 14, runs: 639, batting_avg: 53.25, batting_sr: 139.52, fours: 55, sixes: 23, wickets: 0, economy: 0, catches: 8 },
      { year: 2024, matches: 15, runs: 741, batting_avg: 61.75, batting_sr: 154.69, fours: 62, sixes: 38, wickets: 0, economy: 0, catches: 12 },
    ],
  },
  '3': {
    id: '3', name: 'Jasprit Bumrah', country: 'India', dob: '1993-12-06', batting_hand: 'Right', bowling_skill: 'Right-arm fast',
    primary_role: 'Bowler', batting_position: 'N/A', origin: 'Indian',
    seasons: [
      { year: 2016, matches: 14, runs: 4, batting_avg: 2.0, batting_sr: 50.0, fours: 0, sixes: 0, wickets: 15, economy: 7.50, catches: 2 },
      { year: 2017, matches: 14, runs: 3, batting_avg: 1.5, batting_sr: 33.3, fours: 0, sixes: 0, wickets: 20, economy: 7.04, catches: 3 },
      { year: 2018, matches: 14, runs: 6, batting_avg: 3.0, batting_sr: 60.0, fours: 0, sixes: 0, wickets: 17, economy: 6.96, catches: 2 },
      { year: 2019, matches: 16, runs: 8, batting_avg: 4.0, batting_sr: 80.0, fours: 1, sixes: 0, wickets: 19, economy: 6.63, catches: 3 },
      { year: 2020, matches: 15, runs: 5, batting_avg: 2.5, batting_sr: 50.0, fours: 0, sixes: 0, wickets: 27, economy: 6.73, catches: 2 },
      { year: 2023, matches: 14, runs: 12, batting_avg: 6.0, batting_sr: 85.7, fours: 1, sixes: 0, wickets: 20, economy: 7.30, catches: 3 },
      { year: 2024, matches: 13, runs: 8, batting_avg: 4.0, batting_sr: 66.7, fours: 0, sixes: 0, wickets: 20, economy: 6.48, catches: 2 },
    ],
  },
};

// Generate fallback for any player ID not explicitly listed
function getPlayer(id: string) {
  if (PLAYERS[id]) return PLAYERS[id];
  const names: Record<string, string> = { '2': 'Rohit Sharma', '4': 'MS Dhoni', '5': 'Ravindra Jadeja', '6': 'Sunil Narine', '7': 'Rashid Khan', '8': 'KL Rahul', '9': 'Rishabh Pant', '10': 'Yuzvendra Chahal', '11': 'Shubman Gill', '12': 'Pat Cummins' };
  const name = names[id] || 'Player';
  return {
    id, name, country: 'India', dob: '1990-01-01', batting_hand: 'Right', bowling_skill: 'N/A',
    primary_role: 'Batsman', batting_position: 'Middle-Order', origin: 'Indian',
    seasons: Array.from({ length: 6 }, (_, i) => ({
      year: 2019 + i, matches: 12 + Math.floor(Math.random() * 5), runs: 200 + Math.floor(Math.random() * 400),
      batting_avg: 20 + Math.random() * 30, batting_sr: 110 + Math.random() * 40, fours: 15 + Math.floor(Math.random() * 30),
      sixes: 5 + Math.floor(Math.random() * 20), wickets: Math.floor(Math.random() * 10), economy: 6 + Math.random() * 3, catches: 3 + Math.floor(Math.random() * 8),
    })),
  };
}

const CHART_COLORS = { primary: '#ffd700', secondary: '#00e5ff', accent: '#ff6f00', success: '#2ea043' };

export default function PlayerProfilePage({ params }: { params: Promise<{ playerId: string }> }) {
  const { playerId } = use(params);
  const player = getPlayer(playerId);
  const isBowler = player.primary_role === 'Bowler';
  const latestSeason = player.seasons[player.seasons.length - 1];

  const radarData = [
    { stat: 'Batting', value: Math.min(100, (latestSeason.batting_avg / 50) * 100) },
    { stat: 'Power', value: Math.min(100, ((latestSeason.sixes + latestSeason.fours) / 80) * 100) },
    { stat: 'Consistency', value: Math.min(100, (latestSeason.matches / 16) * 100) },
    { stat: 'Bowling', value: Math.min(100, (latestSeason.wickets / 25) * 100) },
    { stat: 'Fielding', value: Math.min(100, (latestSeason.catches / 12) * 100) },
    { stat: 'Strike Rate', value: Math.min(100, ((latestSeason.batting_sr - 100) / 60) * 100) },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
        <Link href="/stats" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>← Back to Players</Link>
      </div>

      {/* Player Header */}
      <div className="glass-card" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
          {/* Avatar placeholder */}
          <div style={{
            width: 96, height: 96, borderRadius: 'var(--radius-full)',
            background: 'var(--theme-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-bold)', color: 'white',
            border: '3px solid var(--theme-card-border)', flexShrink: 0,
          }}>
            {getInitials(player.name)}
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>{player.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <span>{getCountryFlag(player.country)} {player.country}</span>
              <span className={`badge ${getRoleBadgeClass(player.primary_role as 'Batsman')}`}>{player.primary_role}</span>
              {player.batting_position !== 'N/A' && <span className="badge badge-primary">{player.batting_position}</span>}
              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Age: {calculateAge(player.dob)}</span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>{player.batting_hand}-hand bat</span>
            </div>
          </div>

          {/* Career Highlights */}
          <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', color: 'var(--color-batting)' }}>
                {player.seasons.reduce((s, ss) => s + ss.runs, 0).toLocaleString()}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total Runs</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', color: 'var(--color-bowling)' }}>
                {player.seasons.reduce((s, ss) => s + ss.wickets, 0)}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total Wickets</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', color: 'var(--theme-primary)' }}>
                {player.seasons.reduce((s, ss) => s + ss.matches, 0)}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Matches</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        {/* Performance Trend Chart */}
        <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>{isBowler ? '🎯 Wickets per Season' : '🏏 Runs per Season'}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={player.seasons}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" tick={{ fill: '#8b949e', fontSize: 12 }} />
              <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#141b2d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0f6fc' }} />
              <Bar dataKey={isBowler ? 'wickets' : 'runs'} fill={isBowler ? CHART_COLORS.secondary : CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>⚡ Skill Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="stat" tick={{ fill: '#8b949e', fontSize: 11 }} />
              <PolarRadiusAxis tick={false} domain={[0, 100]} />
              <Radar dataKey="value" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strike Rate / Economy Trend */}
      <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>{isBowler ? '📉 Economy Rate Trend' : '📈 Strike Rate Trend'}</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={player.seasons}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="year" tick={{ fill: '#8b949e', fontSize: 12 }} />
            <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} />
            <Tooltip contentStyle={{ background: '#141b2d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0f6fc' }} />
            <Line type="monotone" dataKey={isBowler ? 'economy' : 'batting_sr'} stroke={CHART_COLORS.accent} strokeWidth={3} dot={{ r: 5, fill: CHART_COLORS.accent }} />
            <Line type="monotone" dataKey="batting_avg" stroke={CHART_COLORS.success} strokeWidth={2} dot={{ r: 4, fill: CHART_COLORS.success }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Season-by-Season Stats Table */}
      <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>📊 Season-by-Season Statistics</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Season</th><th>Mat</th><th>Runs</th><th>Avg</th><th>SR</th><th>4s</th><th>6s</th><th>Wkts</th><th>Econ</th><th>Ct</th>
              </tr>
            </thead>
            <tbody>
              {player.seasons.map((s) => (
                <tr key={s.year}>
                  <td style={{ fontWeight: 'var(--weight-semibold)' }}>{s.year}</td>
                  <td>{s.matches}</td>
                  <td style={{ color: 'var(--color-batting)', fontWeight: 'var(--weight-semibold)' }}>{s.runs}</td>
                  <td>{s.batting_avg.toFixed(2)}</td>
                  <td>{s.batting_sr.toFixed(2)}</td>
                  <td>{s.fours}</td>
                  <td>{s.sixes}</td>
                  <td style={{ color: s.wickets > 0 ? 'var(--color-bowling)' : 'var(--color-text-muted)', fontWeight: s.wickets > 0 ? 'var(--weight-semibold)' : 'var(--weight-normal)' }}>{s.wickets}</td>
                  <td>{s.economy > 0 ? s.economy.toFixed(2) : '-'}</td>
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
