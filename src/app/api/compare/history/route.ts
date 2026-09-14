import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createServiceSupabase } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ comparisons: [] });
    }

    const serviceSupabase = await createServiceSupabase();
    const { data, error } = await serviceSupabase
      .from('comparison_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching comparison history:', error);
      return NextResponse.json({ comparisons: [] });
    }

    return NextResponse.json({ comparisons: data || [] });
  } catch (err: any) {
    console.error('Error in GET /api/compare/history:', err);
    return NextResponse.json({ comparisons: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { player_ids, ai_insights, ai_verdict } = body;

    if (!player_ids || !Array.isArray(player_ids) || player_ids.length < 2) {
      return NextResponse.json({ error: 'At least 2 player IDs required' }, { status: 400 });
    }

    const serviceSupabase = await createServiceSupabase();

    const { data, error } = await serviceSupabase
      .from('comparison_history')
      .insert({
        user_id: user.id,
        player_ids,
        ai_insights: ai_insights || null,
        ai_verdict: ai_verdict || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving comparison history:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, comparison: data });
  } catch (err: any) {
    console.error('Error in POST /api/compare/history:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
