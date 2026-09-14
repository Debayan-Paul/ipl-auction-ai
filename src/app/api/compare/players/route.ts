import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabase } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json({ players: [] });
    }

    const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean);
    if (ids.length === 0) {
      return NextResponse.json({ players: [] });
    }

    const supabase = await createServiceSupabase();

    // Query players by ID
    const { data: players, error: pErr } = await supabase
      .from('players')
      .select('*')
      .in('id', ids);

    if (pErr) {
      console.error('Error fetching compare players:', pErr);
      return NextResponse.json({ error: pErr.message }, { status: 500 });
    }

    // Query season stats for these players
    const { data: stats, error: sErr } = await supabase
      .from('player_season_stats')
      .select('*')
      .in('player_id', ids);

    if (sErr) {
      console.error('Error fetching compare player stats:', sErr);
    }

    const statsMap = new Map<string, any[]>();
    (stats || []).forEach((row) => {
      if (!statsMap.has(row.player_id)) statsMap.set(row.player_id, []);
      statsMap.get(row.player_id)!.push(row);
    });

    const compared = (players || []).map((p) => {
      const pStats = statsMap.get(p.id) || [];
      let totalRuns = 0;
      let totalMatches = 0;
      let totalWickets = 0;
      let totalBallsFaced = 0;
      let totalOvers = 0;
      let totalCatches = 0;
      let totalFours = 0;
      let totalSixes = 0;
      let battingAvg = 0;
      let battingSr = 0;
      let economy = 0;

      pStats.forEach((s) => {
        totalRuns += s.runs || 0;
        totalMatches += s.matches || 0;
        totalWickets += s.wickets || 0;
        totalBallsFaced += s.balls_faced || 0;
        totalOvers += Number(s.overs_bowled) || 0;
        totalCatches += s.catches || 0;
        totalFours += s.fours || 0;
        totalSixes += s.sixes || 0;

        if (s.batting_average && s.batting_average > 0) battingAvg = Number(s.batting_average);
        if (s.batting_strike_rate && s.batting_strike_rate > 0) battingSr = Number(s.batting_strike_rate);
        if (s.economy_rate && s.economy_rate > 0) {
          economy = Number(s.economy_rate);
        } else if (s.bowling_average && s.wickets && totalOvers > 0) {
          economy = (Number(s.bowling_average) * s.wickets) / totalOvers;
        }
      });

      if (battingSr === 0 && totalBallsFaced > 0) {
        battingSr = (totalRuns / totalBallsFaced) * 100;
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
        runs: totalRuns,
        matches: totalMatches,
        batting_avg: Math.round(battingAvg * 100) / 100,
        batting_sr: Math.round(battingSr * 100) / 100,
        wickets: totalWickets,
        economy: Math.round(economy * 100) / 100,
        fours: totalFours,
        sixes: totalSixes,
        catches: totalCatches,
      };
    });

    // Keep the order requested in idsParam
    const ordered = ids
      .map((id) => compared.find((p) => p.id === id))
      .filter(Boolean);

    return NextResponse.json({ players: ordered });
  } catch (err: any) {
    console.error('Error in /api/compare/players:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
