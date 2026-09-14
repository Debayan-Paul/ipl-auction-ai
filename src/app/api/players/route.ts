import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabase } from '@/lib/supabase-server';

export interface PlayerCareerStats {
  id: string;
  name: string;
  slug: string;
  country: string;
  primary_role: string;
  batting_position: string;
  bowling_skill: string;
  batting_hand: string;
  origin: 'Indian' | 'Overseas';
  image_path: string | null;
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
}

// In-memory cache for all aggregated players
let cachedPlayers: PlayerCareerStats[] | null = null;
let cacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function getAllPlayersWithStats(): Promise<PlayerCareerStats[]> {
  const now = Date.now();
  if (cachedPlayers && (now - cacheTime < CACHE_TTL_MS)) {
    return cachedPlayers;
  }

  const supabase = await createServiceSupabase();

  // Fetch all players
  const { data: players, error: playerErr } = await supabase
    .from('players')
    .select('*')
    .order('name', { ascending: true });

  if (playerErr || !players) {
    console.error('Error fetching players:', playerErr);
    throw new Error(playerErr?.message || 'Failed to fetch players');
  }

  // Fetch all stats
  const { data: stats, error: statsErr } = await supabase
    .from('player_season_stats')
    .select('*');

  if (statsErr) {
    console.error('Error fetching player season stats:', statsErr);
  }

  // Map stats by player_id
  const statsMap = new Map<string, any[]>();
  (stats || []).forEach((row) => {
    if (!statsMap.has(row.player_id)) {
      statsMap.set(row.player_id, []);
    }
    statsMap.get(row.player_id)!.push(row);
  });

  const aggregated: PlayerCareerStats[] = players.map((p) => {
    const pStats = statsMap.get(p.id) || [];

    let totalRuns = 0;
    let totalMatches = 0;
    let totalWickets = 0;
    let totalBallsFaced = 0;
    let totalOversBowled = 0;
    let totalCatches = 0;
    let totalFours = 0;
    let totalSixes = 0;
    let totalFifties = 0;
    let totalCenturies = 0;
    let maxScore = 0;
    let battingAvg = 0;
    let battingSr = 0;
    let economy = 0;

    if (pStats.length > 0) {
      pStats.forEach((s) => {
        totalRuns += s.runs || 0;
        totalMatches += s.matches || 0;
        totalWickets += s.wickets || 0;
        totalBallsFaced += s.balls_faced || 0;
        totalOversBowled += Number(s.overs_bowled) || 0;
        totalCatches += s.catches || 0;
        totalFours += s.fours || 0;
        totalSixes += s.sixes || 0;
        totalFifties += s.fifties || 0;
        totalCenturies += s.centuries || 0;
        if ((s.highest_score || 0) > maxScore) {
          maxScore = s.highest_score;
        }

        // Use recorded batting_average / strike_rate if available
        if (s.batting_average && s.batting_average > 0) {
          battingAvg = Number(s.batting_average);
        }
        if (s.batting_strike_rate && s.batting_strike_rate > 0) {
          battingSr = Number(s.batting_strike_rate);
        }
        if (s.economy_rate && s.economy_rate > 0) {
          economy = Number(s.economy_rate);
        } else if (s.bowling_average && s.wickets && totalOversBowled > 0) {
          const runsConceded = Number(s.bowling_average) * s.wickets;
          economy = runsConceded / totalOversBowled;
        }
      });

      // Fallback calculation for strike rate if balls faced recorded
      if (battingSr === 0 && totalBallsFaced > 0) {
        battingSr = (totalRuns / totalBallsFaced) * 100;
      }
    }

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      country: p.country,
      primary_role: p.primary_role,
      batting_position: p.batting_position || (p.primary_role === 'Bowler' ? 'N/A' : 'Middle-Order'),
      bowling_skill: p.bowling_skill || 'N/A',
      batting_hand: p.batting_hand || 'Right',
      origin: p.origin || (p.country === 'India' ? 'Indian' : 'Overseas'),
      image_path: p.image_path || null,
      base_price: p.base_price ? Number(p.base_price) : null,
      runs: totalRuns,
      matches: totalMatches,
      batting_avg: Math.round(battingAvg * 100) / 100,
      batting_sr: Math.round(battingSr * 100) / 100,
      wickets: totalWickets,
      economy: Math.round(economy * 100) / 100,
      overs_bowled: Math.round(totalOversBowled * 10) / 10,
      catches: totalCatches,
      fours: totalFours,
      sixes: totalSixes,
      fifties: totalFifties,
      centuries: totalCenturies,
      highest_score: maxScore,
    };
  });

  // Default sorting: sort by runs descending so recognizable legends lead the list
  aggregated.sort((a, b) => b.runs - a.runs);

  cachedPlayers = aggregated;
  cacheTime = now;
  return aggregated;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase().trim() || '';
    const role = searchParams.get('role');
    const origin = searchParams.get('origin');
    const sortBy = searchParams.get('sortBy') || 'runs';
    const sortOrder = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '24', 10);
    const all = searchParams.get('all') === 'true';

    const allPlayers = await getAllPlayersWithStats();

    // Apply filtering
    let filtered = allPlayers.filter((p) => {
      if (search) {
        const matchesName = p.name.toLowerCase().includes(search);
        const matchesCountry = p.country.toLowerCase().includes(search);
        if (!matchesName && !matchesCountry) return false;
      }

      if (role && role !== 'All') {
        if (p.primary_role.toLowerCase() !== role.toLowerCase()) return false;
      }

      if (origin && origin !== 'All') {
        if (p.origin.toLowerCase() !== origin.toLowerCase()) return false;
      }

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'wickets') {
        comparison = b.wickets - a.wickets || b.runs - a.runs;
      } else if (sortBy === 'matches') {
        comparison = b.matches - a.matches;
      } else if (sortBy === 'batting_avg') {
        comparison = b.batting_avg - a.batting_avg;
      } else if (sortBy === 'batting_sr') {
        comparison = b.batting_sr - a.batting_sr;
      } else {
        // default: runs
        comparison = b.runs - a.runs || b.matches - a.matches;
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });

    if (all) {
      return NextResponse.json({
        players: filtered,
        totalCount: filtered.length,
        totalInDb: allPlayers.length,
        page: 1,
        totalPages: 1,
      });
    }

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const validPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (validPage - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      players: paginated,
      totalCount,
      totalInDb: allPlayers.length,
      page: validPage,
      totalPages,
      limit,
    });
  } catch (err: any) {
    console.error('Error in /api/players:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
