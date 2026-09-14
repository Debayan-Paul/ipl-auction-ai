import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabase } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServiceSupabase();

    const { data, error } = await supabase
      .from('ai_predictions')
      .select(`
        id,
        season_year,
        model_version,
        predicted_runs,
        predicted_batting_avg,
        predicted_batting_sr,
        predicted_wickets,
        predicted_economy,
        confidence,
        trend,
        players (
          id,
          name,
          slug,
          primary_role,
          country,
          origin
        )
      `)
      .order('confidence', { ascending: false });

    if (error) {
      console.error('Error fetching AI predictions in API route:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ predictions: data || [] });
  } catch (err: any) {
    console.error('Error in /api/predictions:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
