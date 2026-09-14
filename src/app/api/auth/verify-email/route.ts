import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth-tokens';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, email, code } = body;

    let targetUserId: string | null = null;

    // Method A: Verification via signed token link
    if (token && typeof token === 'string') {
      const payload = verifyToken(token, 'verify');
      if (!payload) {
        return NextResponse.json({ error: 'Invalid or expired verification link' }, { status: 400 });
      }

      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(payload.userId);
      if (userError || !userData?.user) {
        return NextResponse.json({ error: 'User account not found' }, { status: 404 });
      }

      const user = userData.user;
      if (user.app_metadata?.verify_nonce !== payload.nonce) {
        return NextResponse.json({ error: 'This verification link has already been used or expired' }, { status: 400 });
      }

      targetUserId = user.id;
    } 
    // Method B: Verification via 6-digit code + email
    else if (email && code) {
      const cleanEmail = String(email).trim().toLowerCase();
      const cleanCode = String(code).trim();

      const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError || !usersData?.users) {
        return NextResponse.json({ error: 'Failed to find account' }, { status: 500 });
      }

      const user = usersData.users.find(u => u.email?.toLowerCase() === cleanEmail);
      if (!user) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      }

      const storedCode = user.app_metadata?.verify_code;
      const storedExpires = user.app_metadata?.verify_expires;

      if (!storedCode || storedCode !== cleanCode) {
        return NextResponse.json({ error: 'Invalid 6-digit verification code' }, { status: 400 });
      }

      if (storedExpires && new Date(storedExpires) < new Date()) {
        return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
      }

      targetUserId = user.id;
    } else {
      return NextResponse.json({ error: 'Verification token or code is required' }, { status: 400 });
    }

    // Mark user as verified in Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
      email_confirm: true,
      app_metadata: {
        email_verified: true,
        verify_nonce: null,
        verify_code: null,
        verify_expires: null,
      },
    });

    if (updateError) {
      console.error('[AUTH] Failed to verify user:', updateError);
      return NextResponse.json({ error: 'Failed to verify account' }, { status: 500 });
    }

    console.log(`[AUTH] Successfully verified email for user ${targetUserId}`);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now sign in.',
    });
  } catch (err: any) {
    console.error('[AUTH] Verify Email Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
