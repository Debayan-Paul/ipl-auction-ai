'use client';

import { useState, useMemo } from 'react';
import { getInitials, getRoleBadgeClass, getCountryFlag, cn } from '@/lib/utils';
import type { PlayerRole } from '@/lib/types';

// Demo player data
const ALL_PLAYERS = [
  { id: '1', name: 'Virat Kohli', country: 'India', primary_role: 'Batsman' as PlayerRole, runs: 7263, matches: 237, batting_avg: 37.25, batting_sr: 130.41, wickets: 4, economy: 8.80, fours: 624, sixes: 244, catches: 109 },
  { id: '2', name: 'Rohit Sharma', country: 'India', primary_role: 'Batsman' as PlayerRole, runs: 6211, matches: 243, batting_avg: 29.58, batting_sr: 130.39, wickets: 15, economy: 7.95, fours: 536, sixes: 270, catches: 83 },
  { id: '3', name: 'Jasprit Bumrah', country: 'India', primary_role: 'Bowler' as PlayerRole, runs: 56, matches: 120, batting_avg: 5.09, batting_sr: 85.0, wickets: 145, economy: 7.39, fours: 3, sixes: 1, catches: 18 },
  { id: '4', name: 'MS Dhoni', country: 'India', primary_role: 'Wicket-Keeper' as PlayerRole, runs: 5243, matches: 264, batting_avg: 38.09, batting_sr: 135.20, wickets: 0, economy: 0, fours: 364, sixes: 239, catches: 155 },
  { id: '5', name: 'Ravindra Jadeja', country: 'India', primary_role: 'All-Rounder' as PlayerRole, runs: 2692, matches: 226, batting_avg: 26.92, batting_sr: 128.20, wickets: 132, economy: 7.60, fours: 187, sixes: 92, catches: 82 },
  { id: '6', name: 'Sunil Narine', country: 'West Indies', primary_role: 'All-Rounder' as PlayerRole, runs: 1460, matches: 177, batting_avg: 17.90, batting_sr: 162.50, wickets: 163, economy: 6.67, fours: 115, sixes: 98, catches: 41 },
  { id: '7', name: 'Rashid Khan', country: 'Afghanistan', primary_role: 'Bowler' as PlayerRole, runs: 461, matches: 107, batting_avg: 15.37, batting_sr: 145.11, wickets: 112, economy: 6.55, fours: 22, sixes: 32, catches: 28 },
  { id: '8', name: 'KL Rahul', country: 'India', primary_role: 'Batsman' as PlayerRole, runs: 4683, matches: 132, batting_avg: 45.47, batting_sr: 134.60, wickets: 0, economy: 0, fours: 399, sixes: 168, catches: 61 },
  { id: '9', name: 'Rishabh Pant', country: 'India', primary_role: 'Wicket-Keeper' as PlayerRole, runs: 2838, matches: 98, batting_avg: 34.61, batting_sr: 148.68, wickets: 0, economy: 0, fours: 237, sixes: 131, catches: 67 },
  { id: '10', name: 'Yuzvendra Chahal', country: 'India', primary_role: 'Bowler' as PlayerRole, runs: 71, matches: 145, batting_avg: 4.73, batting_sr: 68.27, wickets: 187, economy: 7.58, fours: 7, sixes: 2, catches: 22 },
];

const FEATURED_COMPARISONS = [
  { players: ['1', '2'], label: 'Kohli vs Rohit' },
  { players: ['3', '10'], label: 'Bumrah vs Chahal' },
  { players: ['4', '9'], label: 'Dhoni vs Pant' },
  { players: ['5', '6'], label: 'Jadeja vs Narine' },
];

interface GeminiInsight {
  pros: string[];
  cons: string[];
  score: number;
}

export default function ComparePage() {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [roleFilter, setRoleFilter] = useState<PlayerRole | null>(null);
  const [aiInsights, setAiInsights] = useState<Record<string, GeminiInsight>>({});
  const [aiVerdict, setAiVerdict] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);

  const filteredSuggestions = useMemo(() => {
    if (!search && !searchFocused) return [];
    return ALL_PLAYERS.filter((p) => {
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchesRole = !roleFilter || p.primary_role === roleFilter;
      const notSelected = !selectedPlayers.includes(p.id);
      return matchesSearch && matchesRole && notSelected;
    }).slice(0, 6);
  }, [search, searchFocused, roleFilter, selectedPlayers]);

  const selectedData = useMemo(() => {
    return selectedPlayers.map((id) => ALL_PLAYERS.find((p) => p.id === id)!).filter(Boolean);
  }, [selectedPlayers]);

  const addPlayer = (id: string) => {
    if (selectedPlayers.length < 4 && !selectedPlayers.includes(id)) {
      setSelectedPlayers([...selectedPlayers, id]);
      setSearch('');
    }
  };

  const removePlayer = (id: string) => {
    setSelectedPlayers(selectedPlayers.filter((pid) => pid !== id));
    const newInsights = { ...aiInsights };
    delete newInsights[id];
    setAiInsights(newInsights);
    setAiVerdict('');
  };

  const loadFeatured = (playerIds: string[]) => {
    setSelectedPlayers(playerIds);
    setAiInsights({});
    setAiVerdict('');
  };

  const generateAiInsights = async () => {
    if (selectedData.length < 2) return;
    setAiLoading(true);

    // Simulated Gemini API response — in production this calls /api/compare/ai-insights
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockInsights: Record<string, GeminiInsight> = {};
    selectedData.forEach((player, idx) => {
      const isFirst = idx === 0;
      mockInsights[player.id] = {
        pros: [
          `Exceptional ${player.primary_role === 'Bowler' ? 'bowling accuracy' : 'batting consistency'} across seasons`,
          `Proven performer in high-pressure IPL finals and playoffs`,
          `${player.matches}+ IPL matches — invaluable experience and composure`,
          player.primary_role !== 'Bowler' ? `Impressive strike rate of ${player.batting_sr} shows attacking intent` : `Economy rate of ${player.economy} among the best in IPL`,
        ],
        cons: [
          isFirst ? 'Struggles against quality left-arm spin in the middle overs' : 'Inconsistent starts — either big score or early dismissal',
          `Recent form has shown slight decline compared to peak years`,
          player.primary_role === 'Bowler' ? 'Limited batting contribution in lower order' : 'Fielding impact not as significant as top performers',
        ],
        score: Math.floor(70 + Math.random() * 25),
      };
    });

    setAiInsights(mockInsights);

    const names = selectedData.map((p) => p.name);
    const scores = selectedData.map((p) => mockInsights[p.id].score);
    const bestIdx = scores.indexOf(Math.max(...scores));
    setAiVerdict(
      `Based on comprehensive IPL career analysis, **${names[bestIdx]}** edges ahead with a score of ${scores[bestIdx]}/100. While both are elite players, ${names[bestIdx]} demonstrates superior consistency and match-winning ability in high-stakes encounters.`
    );

    setAiLoading(false);
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ marginBottom: 'var(--space-2)' }}>Compare Players</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Select 2-4 players to compare stats side-by-side with AI-powered insights.
        </p>
      </div>

      {/* Search & Selection */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        {/* Quick filter chips */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
          {(['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'] as PlayerRole[]).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(roleFilter === role ? null : role)}
              className={cn('btn btn-sm', roleFilter === role ? 'btn-primary' : 'btn-ghost')}
              style={{ fontSize: 'var(--text-xs)' }}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="input"
            placeholder="🔍 Search players to compare (type 2+ chars)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            style={{ fontSize: 'var(--text-sm)' }}
          />

          {/* Autocomplete dropdown */}
          {filteredSuggestions.length > 0 && (search.length >= 2 || searchFocused) && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              marginTop: 'var(--space-1)',
              zIndex: 'var(--z-dropdown)',
              maxHeight: 300,
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
            }}>
              {filteredSuggestions.map((player) => (
                <button
                  key={player.id}
                  onClick={() => addPlayer(player.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    width: '100%',
                    padding: 'var(--space-3) var(--space-4)',
                    border: 'none',
                    background: 'none',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    transition: 'background var(--transition-fast)',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--theme-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--weight-bold)',
                    color: 'white',
                    flexShrink: 0,
                  }}>
                    {getInitials(player.name)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'var(--weight-medium)' }}>{player.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'flex', gap: 'var(--space-2)' }}>
                      <span>{getCountryFlag(player.country)}</span>
                      <span className={`badge ${getRoleBadgeClass(player.primary_role)}`}>{player.primary_role}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Players */}
      {selectedData.length > 0 && (
        <div style={{
          display: 'flex',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-6)',
          flexWrap: 'wrap',
        }}>
          {selectedData.map((player) => (
            <div
              key={player.id}
              className="glass-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-full)',
              }}
            >
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-full)',
                background: 'var(--theme-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'var(--weight-bold)',
                color: 'white',
              }}>
                {getInitials(player.name)}
              </div>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>{player.name}</span>
              <button
                onClick={() => removePlayer(player.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  padding: '0 2px',
                }}
              >
                ✕
              </button>
            </div>
          ))}

          {selectedData.length >= 2 && (
            <button
              className="btn btn-primary btn-sm"
              onClick={generateAiInsights}
              disabled={aiLoading}
            >
              {aiLoading ? '🔄 Analyzing...' : '🤖 Get AI Verdict'}
            </button>
          )}
        </div>
      )}

      {/* Comparison Table */}
      {selectedData.length >= 2 && (
        <div className="table-wrapper" style={{ marginBottom: 'var(--space-8)' }}>
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                {selectedData.map((p) => (
                  <th key={p.id} style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-1)' }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--theme-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--weight-bold)',
                        color: 'white',
                      }}>
                        {getInitials(p.name)}
                      </div>
                      <span style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>{p.name}</span>
                      <span className={`badge ${getRoleBadgeClass(p.primary_role)}`}>{p.primary_role}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Matches', key: 'matches' },
                { label: 'Runs', key: 'runs' },
                { label: 'Batting Avg', key: 'batting_avg' },
                { label: 'Strike Rate', key: 'batting_sr' },
                { label: 'Fours', key: 'fours' },
                { label: 'Sixes', key: 'sixes' },
                { label: 'Wickets', key: 'wickets' },
                { label: 'Economy', key: 'economy' },
                { label: 'Catches', key: 'catches' },
              ].map((metric) => {
                const values = selectedData.map((p) => (p as Record<string, unknown>)[metric.key] as number);
                const maxVal = Math.max(...values);
                const minVal = Math.min(...values);
                const isLowerBetter = metric.key === 'economy';

                return (
                  <tr key={metric.key}>
                    <td style={{ fontWeight: 'var(--weight-medium)' }}>{metric.label}</td>
                    {selectedData.map((p, idx) => {
                      const val = values[idx];
                      const isBest = isLowerBetter
                        ? val === minVal && val > 0
                        : val === maxVal && val > 0;
                      return (
                        <td key={p.id} style={{
                          textAlign: 'center',
                          fontWeight: isBest ? 'var(--weight-bold)' : 'var(--weight-normal)',
                          color: isBest ? 'var(--color-success)' : 'var(--color-text-secondary)',
                          fontSize: 'var(--text-base)',
                        }}>
                          {typeof val === 'number' ? (Number.isInteger(val) ? val.toLocaleString() : val.toFixed(2)) : val}
                          {isBest && ' ✓'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Insights */}
      {Object.keys(aiInsights).length > 0 && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h3 style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            🤖 AI Analysis <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--weight-normal)' }}>Powered by Gemini</span>
          </h3>

          {/* Verdict Banner */}
          {aiVerdict && (
            <div className="theme-card" style={{
              marginBottom: 'var(--space-6)',
              padding: 'var(--space-6)',
              borderLeft: '4px solid var(--theme-accent)',
            }}>
              <div style={{ fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-2)', color: 'var(--theme-accent)' }}>
                🏆 Final Verdict
              </div>
              <p style={{ lineHeight: 'var(--leading-relaxed)' }}>
                {aiVerdict}
              </p>
            </div>
          )}

          {/* Pros/Cons Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${selectedData.length}, 1fr)`,
            gap: 'var(--space-4)',
          }}>
            {selectedData.map((player) => {
              const insight = aiInsights[player.id];
              if (!insight) return null;

              return (
                <div key={player.id} className="glass-card" style={{ padding: 'var(--space-6)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--theme-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--weight-bold)',
                        color: 'white',
                      }}>
                        {getInitials(player.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-lg)' }}>{player.name}</div>
                        <span className={`badge ${getRoleBadgeClass(player.primary_role)}`}>{player.primary_role}</span>
                      </div>
                    </div>

                    {/* Score Badge */}
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-full)',
                      background: insight.score >= 85 ? 'var(--color-success-surface)' : insight.score >= 70 ? 'var(--color-warning-surface)' : 'var(--color-danger-surface)',
                      border: `2px solid ${insight.score >= 85 ? 'var(--color-success)' : insight.score >= 70 ? 'var(--color-warning)' : 'var(--color-danger)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 'var(--weight-extrabold)',
                      fontSize: 'var(--text-lg)',
                      color: insight.score >= 85 ? 'var(--color-success)' : insight.score >= 70 ? 'var(--color-warning)' : 'var(--color-danger)',
                    }}>
                      {insight.score}
                    </div>
                  </div>

                  {/* Pros */}
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-success)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
                      ✅ Strengths
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {insight.pros.map((pro, i) => (
                        <li key={i} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', paddingLeft: 'var(--space-4)', position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 0, color: 'var(--color-success)' }}>+</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cons */}
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-danger)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
                      ⚠️ Weaknesses
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {insight.cons.map((con, i) => (
                        <li key={i} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', paddingLeft: 'var(--space-4)', position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 0, color: 'var(--color-danger)' }}>−</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Featured Comparisons */}
      <div style={{ marginTop: 'var(--space-12)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>⭐ Featured Comparisons</h3>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {FEATURED_COMPARISONS.map((comp) => (
            <button
              key={comp.label}
              className="glass-card"
              onClick={() => loadFeatured(comp.players)}
              style={{
                padding: 'var(--space-3) var(--space-5)',
                cursor: 'pointer',
                border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-medium)',
                borderRadius: 'var(--radius-lg)',
                transition: 'all var(--transition-fast)',
              }}
            >
              ⚔️ {comp.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
