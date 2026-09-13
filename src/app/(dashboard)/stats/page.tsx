'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { getInitials, getRoleBadgeClass, getCountryFlag, cn } from '@/lib/utils';
import type { PlayerRole } from '@/lib/types';
import styles from './stats.module.css';

// Demo data — in production this comes from Supabase
const DEMO_PLAYERS = [
  { id: '1', name: 'Virat Kohli', slug: 'virat-kohli', country: 'India', primary_role: 'Batsman' as PlayerRole, batting_position: 'Middle-Order', image_path: null, runs: 7263, matches: 237, batting_avg: 37.25, batting_sr: 130.41, wickets: 4, economy: 8.80, origin: 'Indian' as const },
  { id: '2', name: 'Rohit Sharma', slug: 'rohit-sharma', country: 'India', primary_role: 'Batsman' as PlayerRole, batting_position: 'Opener', image_path: null, runs: 6211, matches: 243, batting_avg: 29.58, batting_sr: 130.39, wickets: 15, economy: 7.95, origin: 'Indian' as const },
  { id: '3', name: 'Jasprit Bumrah', slug: 'jasprit-bumrah', country: 'India', primary_role: 'Bowler' as PlayerRole, batting_position: 'N/A', image_path: null, runs: 56, matches: 120, batting_avg: 5.09, batting_sr: 85.0, wickets: 145, economy: 7.39, origin: 'Indian' as const },
  { id: '4', name: 'MS Dhoni', slug: 'ms-dhoni', country: 'India', primary_role: 'Wicket-Keeper' as PlayerRole, batting_position: 'Finisher', image_path: null, runs: 5243, matches: 264, batting_avg: 38.09, batting_sr: 135.20, wickets: 0, economy: 0, origin: 'Indian' as const },
  { id: '5', name: 'Ravindra Jadeja', slug: 'ravindra-jadeja', country: 'India', primary_role: 'All-Rounder' as PlayerRole, batting_position: 'Middle-Order', image_path: null, runs: 2692, matches: 226, batting_avg: 26.92, batting_sr: 128.20, wickets: 132, economy: 7.60, origin: 'Indian' as const },
  { id: '6', name: 'Sunil Narine', slug: 'sunil-narine', country: 'West Indies', primary_role: 'All-Rounder' as PlayerRole, batting_position: 'Opener', image_path: null, runs: 1460, matches: 177, batting_avg: 17.90, batting_sr: 162.50, wickets: 163, economy: 6.67, origin: 'Overseas' as const },
  { id: '7', name: 'Pat Cummins', slug: 'pat-cummins', country: 'Australia', primary_role: 'Bowler' as PlayerRole, batting_position: 'N/A', image_path: null, runs: 152, matches: 38, batting_avg: 11.69, batting_sr: 113.43, wickets: 44, economy: 8.85, origin: 'Overseas' as const },
  { id: '8', name: 'Rashid Khan', slug: 'rashid-khan', country: 'Afghanistan', primary_role: 'Bowler' as PlayerRole, batting_position: 'N/A', image_path: null, runs: 461, matches: 107, batting_avg: 15.37, batting_sr: 145.11, wickets: 112, economy: 6.55, origin: 'Overseas' as const },
  { id: '9', name: 'KL Rahul', slug: 'kl-rahul', country: 'India', primary_role: 'Batsman' as PlayerRole, batting_position: 'Opener', image_path: null, runs: 4683, matches: 132, batting_avg: 45.47, batting_sr: 134.60, wickets: 0, economy: 0, origin: 'Indian' as const },
  { id: '10', name: 'Shubman Gill', slug: 'shubman-gill', country: 'India', primary_role: 'Batsman' as PlayerRole, batting_position: 'Opener', image_path: null, runs: 2620, matches: 78, batting_avg: 36.39, batting_sr: 131.13, wickets: 0, economy: 0, origin: 'Indian' as const },
  { id: '11', name: 'Rishabh Pant', slug: 'rishabh-pant', country: 'India', primary_role: 'Wicket-Keeper' as PlayerRole, batting_position: 'Middle-Order', image_path: null, runs: 2838, matches: 98, batting_avg: 34.61, batting_sr: 148.68, wickets: 0, economy: 0, origin: 'Indian' as const },
  { id: '12', name: 'Yuzvendra Chahal', slug: 'yuzvendra-chahal', country: 'India', primary_role: 'Bowler' as PlayerRole, batting_position: 'N/A', image_path: null, runs: 71, matches: 145, batting_avg: 4.73, batting_sr: 68.27, wickets: 187, economy: 7.58, origin: 'Indian' as const },
];

const ROLE_FILTERS: PlayerRole[] = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'];
const ORIGIN_FILTERS = ['Indian', 'Overseas'] as const;

export default function StatsPage() {
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<PlayerRole | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState<typeof ORIGIN_FILTERS[number] | null>(null);

  const filteredPlayers = useMemo(() => {
    return DEMO_PLAYERS.filter((player) => {
      const matchesSearch = player.name.toLowerCase().includes(search.toLowerCase()) ||
        player.country.toLowerCase().includes(search.toLowerCase());
      const matchesRole = !selectedRole || player.primary_role === selectedRole;
      const matchesOrigin = !selectedOrigin || player.origin === selectedOrigin;
      return matchesSearch && matchesRole && matchesOrigin;
    });
  }, [search, selectedRole, selectedOrigin]);

  return (
    <div className={styles['stats-page']}>
      {/* Toolbar */}
      <div className={styles['stats-toolbar']}>
        <div className={styles['search-box']}>
          <span className={styles['search-icon']}>🔍</span>
          <input
            type="text"
            className={styles['search-input']}
            placeholder="Search players by name or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles['filter-chips']}>
          {ROLE_FILTERS.map((role) => (
            <button
              key={role}
              className={cn(styles['filter-chip'], selectedRole === role && styles.active)}
              onClick={() => setSelectedRole(selectedRole === role ? null : role)}
            >
              {role}
            </button>
          ))}
          <div style={{ width: 1, height: 24, background: 'var(--color-border)', margin: '0 var(--space-1)' }} />
          {ORIGIN_FILTERS.map((origin) => (
            <button
              key={origin}
              className={cn(styles['filter-chip'], selectedOrigin === origin && styles.active)}
              onClick={() => setSelectedOrigin(selectedOrigin === origin ? null : origin)}
            >
              {origin === 'Indian' ? '🇮🇳' : '🌍'} {origin}
            </button>
          ))}
        </div>
      </div>

      {/* Results Info */}
      <div className={styles['results-info']}>
        <span className={styles['results-count']}>
          Showing <strong>{filteredPlayers.length}</strong> of {DEMO_PLAYERS.length} players
        </span>
      </div>

      {/* Player Grid */}
      {filteredPlayers.length > 0 ? (
        <div className={cn(styles['player-grid'], 'stagger-children')}>
          {filteredPlayers.map((player) => (
            <Link
              key={player.id}
              href={`/stats/${player.id}`}
              className={cn(styles['player-card'], 'animate-fade-in')}
            >
              <div className={styles['player-card-header']}>
                <div className={styles['player-avatar']}>
                  {getInitials(player.name)}
                </div>
                <div className={styles['player-card-info']}>
                  <div className={styles['player-card-name']}>{player.name}</div>
                  <div className={styles['player-card-meta']}>
                    <span>{getCountryFlag(player.country)}</span>
                    <span className={`badge ${getRoleBadgeClass(player.primary_role)}`}>
                      {player.primary_role}
                    </span>
                    {player.batting_position !== 'N/A' && (
                      <span style={{ color: 'var(--color-text-muted)' }}>• {player.batting_position}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles['player-card-stats']}>
                {player.primary_role === 'Bowler' ? (
                  <>
                    <div className={styles['player-stat']}>
                      <div className={styles['player-stat-value']}>{player.wickets}</div>
                      <div className={styles['player-stat-label']}>Wickets</div>
                    </div>
                    <div className={styles['player-stat']}>
                      <div className={styles['player-stat-value']}>{player.economy.toFixed(1)}</div>
                      <div className={styles['player-stat-label']}>Economy</div>
                    </div>
                    <div className={styles['player-stat']}>
                      <div className={styles['player-stat-value']}>{player.matches}</div>
                      <div className={styles['player-stat-label']}>Matches</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles['player-stat']}>
                      <div className={styles['player-stat-value']}>{player.runs.toLocaleString()}</div>
                      <div className={styles['player-stat-label']}>Runs</div>
                    </div>
                    <div className={styles['player-stat']}>
                      <div className={styles['player-stat-value']}>{player.batting_avg.toFixed(1)}</div>
                      <div className={styles['player-stat-label']}>Average</div>
                    </div>
                    <div className={styles['player-stat']}>
                      <div className={styles['player-stat-value']}>{player.batting_sr.toFixed(1)}</div>
                      <div className={styles['player-stat-label']}>Strike Rate</div>
                    </div>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles['empty-state']}>
          <div className={styles['empty-state-icon']}>🏏</div>
          <h3>No players found</h3>
          <p>Try adjusting your search or filters to find players.</p>
        </div>
      )}
    </div>
  );
}
