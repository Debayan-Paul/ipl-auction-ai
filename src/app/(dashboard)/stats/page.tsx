'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getInitials, getRoleBadgeClass, getCountryFlag, cn } from '@/lib/utils';
import type { PlayerRole } from '@/lib/types';
import styles from './stats.module.css';

interface PlayerItem {
  id: string;
  name: string;
  slug: string;
  country: string;
  primary_role: PlayerRole;
  batting_position: string;
  bowling_skill: string;
  origin: 'Indian' | 'Overseas';
  image_path: string | null;
  base_price: number | null;
  runs: number;
  matches: number;
  batting_avg: number;
  batting_sr: number;
  wickets: number;
  economy: number;
}

const ROLE_FILTERS: PlayerRole[] = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'];
const ORIGIN_FILTERS = ['Indian', 'Overseas'] as const;
const PAGE_SIZE = 24;

export default function StatsPage() {
  const [players, setPlayers] = useState<PlayerItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalInDb, setTotalInDb] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<PlayerRole | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState<typeof ORIGIN_FILTERS[number] | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch players from API
  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (selectedRole) params.set('role', selectedRole);
      if (selectedOrigin) params.set('origin', selectedOrigin);
      params.set('page', page.toString());
      params.set('limit', PAGE_SIZE.toString());

      const res = await fetch(`/api/players?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch players');
      const data = await res.json();

      setPlayers(data.players || []);
      setTotalCount(data.totalCount || 0);
      setTotalInDb(data.totalInDb || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error loading players:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedRole, selectedOrigin, page]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const handleRoleToggle = (role: PlayerRole) => {
    setSelectedRole(selectedRole === role ? null : role);
    setPage(1);
  };

  const handleOriginToggle = (origin: typeof ORIGIN_FILTERS[number]) => {
    setSelectedOrigin(selectedOrigin === origin ? null : origin);
    setPage(1);
  };

  const startIdx = totalCount > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const endIdx = Math.min(page * PAGE_SIZE, totalCount);

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
              onClick={() => handleRoleToggle(role)}
            >
              {role}
            </button>
          ))}
          <div style={{ width: 1, height: 24, background: 'var(--color-border)', margin: '0 var(--space-1)' }} />
          {ORIGIN_FILTERS.map((origin) => (
            <button
              key={origin}
              className={cn(styles['filter-chip'], selectedOrigin === origin && styles.active)}
              onClick={() => handleOriginToggle(origin)}
            >
              {origin === 'Indian' ? '🇮🇳' : '🌍'} {origin}
            </button>
          ))}
        </div>
      </div>

      {/* Results Info */}
      <div className={styles['results-info']}>
        <span className={styles['results-count']}>
          {loading ? (
            'Loading players from database...'
          ) : (
            <>
              Showing <strong>{startIdx}–{endIdx}</strong> of <strong>{totalCount}</strong> players
              {totalInDb > 0 && totalCount !== totalInDb && (
                <span style={{ color: 'var(--color-text-muted)' }}> (filtered from {totalInDb} total)</span>
              )}
            </>
          )}
        </span>

        {totalPages > 1 && (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Page {page} of {totalPages}
          </span>
        )}
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className={styles['player-grid']}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles['skeleton-card']}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div className={styles['skeleton-pulse']} style={{ width: 52, height: 52, borderRadius: '50%' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className={styles['skeleton-pulse']} style={{ height: 18, width: '70%' }} />
                  <div className={styles['skeleton-pulse']} style={{ height: 14, width: '40%' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 24 }}>
                <div className={styles['skeleton-pulse']} style={{ height: 32 }} />
                <div className={styles['skeleton-pulse']} style={{ height: 32 }} />
                <div className={styles['skeleton-pulse']} style={{ height: 32 }} />
              </div>
            </div>
          ))}
        </div>
      ) : players.length > 0 ? (
        <>
          {/* Player Grid */}
          <div className={cn(styles['player-grid'], 'stagger-children')}>
            {players.map((player) => (
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
                      {player.batting_position && player.batting_position !== 'N/A' && (
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
                        <div className={styles['player-stat-value']}>
                          {player.economy > 0 ? player.economy.toFixed(1) : '—'}
                        </div>
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
                        <div className={styles['player-stat-value']}>
                          {player.batting_avg > 0 ? player.batting_avg.toFixed(1) : '—'}
                        </div>
                        <div className={styles['player-stat-label']}>Average</div>
                      </div>
                      <div className={styles['player-stat']}>
                        <div className={styles['player-stat-value']}>
                          {player.batting_sr > 0 ? player.batting_sr.toFixed(1) : '—'}
                        </div>
                        <div className={styles['player-stat-label']}>Strike Rate</div>
                      </div>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className={styles['pagination-container']}>
              <div className={styles['pagination-info']}>
                Showing <strong>{startIdx}</strong> to <strong>{endIdx}</strong> of <strong>{totalCount}</strong> players
              </div>

              <div className={styles['pagination-controls']}>
                <button
                  className={styles['pagination-btn']}
                  disabled={page <= 1}
                  onClick={() => {
                    setPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  ← Prev
                </button>

                <div className={styles['page-numbers']}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                    .map((p, idx, arr) => {
                      const prev = arr[idx - 1];
                      return (
                        <span key={p} style={{ display: 'flex', alignItems: 'center' }}>
                          {prev && p - prev > 1 && (
                            <span style={{ padding: '0 4px', color: 'var(--color-text-muted)' }}>...</span>
                          )}
                          <button
                            className={cn(styles['page-number-btn'], page === p && styles.active)}
                            onClick={() => {
                              setPage(p);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                          >
                            {p}
                          </button>
                        </span>
                      );
                    })}
                </div>

                <button
                  className={styles['pagination-btn']}
                  disabled={page >= totalPages}
                  onClick={() => {
                    setPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className={styles['empty-state']}>
          <div className={styles['empty-state-icon']}>🏏</div>
          <h3>No players found</h3>
          <p>Try adjusting your search query or clear your role/origin filters to find players.</p>
        </div>
      )}
    </div>
  );
}
