import { NextResponse } from 'next/server';
import { createServerSupabase, createServiceSupabase } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    let userId: string | null = null;
    let userEmail = '';

    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      const service = await createServiceSupabase();
      const { data: { user }, error: tokenErr } = await service.auth.getUser(token);
      if (user && !tokenErr) {
        userId = user.id;
        userEmail = user.email || '';
      }
    }

    if (!userId) {
      const supabase = await createServerSupabase();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (session?.user && !sessionError) {
        userId = session.user.id;
        userEmail = session.user.email || '';
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in to perform this action.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { confirmation } = body;

    if (confirmation !== 'DELETE') {
      return NextResponse.json(
        { error: 'Confirmation mismatch. You must type DELETE in capital letters to proceed.' },
        { status: 400 }
      );
    }

    const serviceClient = await createServiceSupabase();

    console.log(`\n🚨 [ACCOUNT DELETION INITIATED]`);
    console.log(`User ID: ${userId}`);
    console.log(`Email: ${userEmail}`);

    // 1. Delete user data from related tables
    try {
      await serviceClient.from('comparison_history').delete().eq('user_id', userId);
      await serviceClient.from('subscriptions').delete().eq('user_id', userId);
      await serviceClient.from('password_reset_tokens').delete().eq('user_id', userId);
      await serviceClient.from('profiles').delete().eq('id', userId);
    } catch (dbErr) {
      console.warn('[ACCOUNT DELETION] Table cleanup notice:', dbErr);
    }

    // 2. Delete user from Supabase Auth
    const { error: deleteUserError } = await serviceClient.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      console.error('[ACCOUNT DELETION] Failed to delete auth user:', deleteUserError);
      return NextResponse.json({ error: deleteUserError.message || 'Failed to delete user account' }, { status: 500 });
    }

    console.log(`✅ [ACCOUNT DELETED SUCCESSFULLY] User: ${userEmail} (${userId})\n`);

    // 3. Clear auth cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    allCookies.forEach((c) => {
      if (c.name.startsWith('sb-') || c.name.includes('auth')) {
        cookieStore.delete(c.name);
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Your account and all associated data have been permanently deleted.',
    });
  } catch (err: any) {
    console.error('[ACCOUNT DELETION] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
