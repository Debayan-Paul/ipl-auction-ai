import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createServiceSupabase } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceSupabase = await createServiceSupabase();
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'debayanpaul629@gmail.com').trim().toLowerCase();
    const isAdmin = (user.email || '').trim().toLowerCase() === adminEmail;
    const effectiveRole = isAdmin ? 'admin' : (profile?.role || 'free');

    return NextResponse.json({
      profile: {
        id: user.id,
        email: user.email,
        full_name: profile?.full_name || user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || '',
        role: effectiveRole,
        team_abbreviation: profile?.team_abbreviation || 'DEFAULT',
      },
    });
  } catch (err: any) {
    console.error('Error in GET /api/user/profile:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, phone, team_abbreviation } = body;

    const serviceSupabase = await createServiceSupabase();

    // 1. Update profiles table
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (full_name !== undefined) updatePayload.full_name = full_name.trim();
    if (team_abbreviation !== undefined) updatePayload.team_abbreviation = team_abbreviation;

    const { error: profileErr } = await serviceSupabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id);

    if (profileErr) {
      console.error('Error updating profiles table:', profileErr);
    }

    // 2. Update user_metadata in auth.users
    const userMetaUpdates: Record<string, any> = {
      ...user.user_metadata,
    };
    if (full_name !== undefined) userMetaUpdates.full_name = full_name.trim();
    if (phone !== undefined) userMetaUpdates.phone = phone.trim();

    const { data: authData, error: authErr } = await serviceSupabase.auth.admin.updateUserById(
      user.id,
      { user_metadata: userMetaUpdates }
    );

    if (authErr) {
      console.error('Error updating auth metadata:', authErr);
      return NextResponse.json({ error: authErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        email: user.email,
        full_name: full_name !== undefined ? full_name.trim() : (profileErr ? user.user_metadata?.full_name : full_name),
        phone: phone !== undefined ? phone.trim() : user.user_metadata?.phone,
        team_abbreviation: team_abbreviation || 'DEFAULT',
      },
    });
  } catch (err: any) {
    console.error('Error in PUT /api/user/profile:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
