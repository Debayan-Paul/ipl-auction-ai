import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth-tokens';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { token, code, email, password } = await req.json();

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    let targetUserId: string;

    // CASE A: 6-Digit Code + Email
    if (code && email) {
      const cleanEmail = email.trim().toLowerCase();
      const cleanCode = code.trim();

      const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError || !usersData?.users) {
        return NextResponse.json({ error: 'Failed to process reset request' }, { status: 500 });
      }

      const user = usersData.users.find(u => u.email?.toLowerCase() === cleanEmail);
      if (!user) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      }

      const storedCode = user.app_metadata?.reset_code;
      const storedExpires = user.app_metadata?.reset_expires;

      if (!storedCode || storedCode !== cleanCode) {
        return NextResponse.json({ error: 'Invalid 6-digit reset code' }, { status: 400 });
      }

      if (storedExpires && new Date(storedExpires) < new Date()) {
        return NextResponse.json({ error: 'Reset code has expired. Please request a new one.' }, { status: 400 });
      }

      targetUserId = user.id;
    }
    // CASE B: Token-based (from email link)
    else if (token) {
      const payload = verifyToken(token, 'reset');
      if (!payload) {
        return NextResponse.json({ error: 'Invalid or expired password reset link' }, { status: 400 });
      }

      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(payload.userId);
      if (userError || !userData?.user) {
        return NextResponse.json({ error: 'User account not found' }, { status: 404 });
      }

      const user = userData.user;
      const storedNonce = user.app_metadata?.reset_nonce;
      const storedExpires = user.app_metadata?.reset_expires;

      if (!storedNonce || storedNonce !== payload.nonce) {
        return NextResponse.json({ error: 'This reset link has already been used or invalidated' }, { status: 400 });
      }

      if (storedExpires && new Date(storedExpires) < new Date()) {
        return NextResponse.json({ error: 'This reset link has expired' }, { status: 400 });
      }

      targetUserId = payload.userId;
    } else {
      return NextResponse.json({ error: 'Either a reset token or email with 6-digit code is required' }, { status: 400 });
    }

    // Update password and clear reset security tokens
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
      password,
      email_confirm: true, // Confirm email as well since password ownership is proven
      app_metadata: {
        reset_nonce: null,
        reset_code: null,
        reset_expires: null,
      },
    });

    if (updateError) {
      console.error('[AUTH] Password Update Error:', updateError);
      return NextResponse.json({ error: updateError.message || 'Failed to update password' }, { status: 500 });
    }

    // Clean up custom password_reset_tokens table if present
    try {
      await supabaseAdmin.from('password_reset_tokens').delete().eq('user_id', targetUserId);
    } catch {
      // Ignore if table does not exist
    }

    console.log(`[AUTH] Successfully updated password for user ID: ${targetUserId}`);

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset. You can now sign in.',
    });
  } catch (err: any) {
    console.error('[AUTH] Reset Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
