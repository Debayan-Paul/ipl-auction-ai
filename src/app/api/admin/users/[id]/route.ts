import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { role, team_abbreviation } = await request.json();

    const updateData: any = {};
    if (role !== undefined) {
      if (role === 'admin') {
        const { data: targetUser } = await supabaseAdmin.from('profiles').select('email').eq('id', id).single();
        const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'debayanpaul629@gmail.com').trim().toLowerCase();
        if ((targetUser?.email || '').trim().toLowerCase() !== adminEmail) {
          return NextResponse.json({ error: 'Access denied: Only debayanpaul629@gmail.com can hold the admin role.' }, { status: 403 });
        }
      }
      updateData.role = role;
    }
    if (team_abbreviation !== undefined) updateData.team_abbreviation = team_abbreviation;

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
