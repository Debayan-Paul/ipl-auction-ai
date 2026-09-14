import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { signToken, generateNonce, generateOtpCode } from '@/lib/auth-tokens';
import { sendPasswordResetEmail } from '@/lib/email';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Locate user in Supabase Auth
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.error('[AUTH] Error listing users:', listError);
      return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }

    const targetUser = usersData.users.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    );

    // To prevent email enumeration, return success even if not found
    if (!targetUser) {
      console.log(`[AUTH] Password reset requested for non-existent email: ${cleanEmail}`);
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a reset link has been dispatched.'
      });
    }

    // 2. Generate secure token, nonce, and 6-digit OTP code
    const nonce = generateNonce();
    const otpCode = generateOtpCode();
    const expiresAt = Date.now() + 1000 * 60 * 60; // 1 hour expiration
    const token = signToken({
      userId: targetUser.id,
      email: targetUser.email || cleanEmail,
      type: 'reset',
      nonce,
      code: otpCode,
      exp: expiresAt,
    });

    // 3. Save nonce, code & expiration securely in app_metadata
    await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
      app_metadata: {
        ...(targetUser.app_metadata || {}),
        reset_nonce: nonce,
        reset_code: otpCode,
        reset_expires: new Date(expiresAt).toISOString(),
      },
    });

    // Also attempt saving to custom password_reset_tokens table if it exists
    try {
      await supabaseAdmin.from('password_reset_tokens').insert({
        user_id: targetUser.id,
        token,
        expires_at: new Date(expiresAt).toISOString(),
      });
    } catch {
      // Table might not exist; app_metadata is the primary reliable store
    }

    // 4. Construct URL and send email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${siteUrl}/reset-password?token=${encodeURIComponent(token)}`;

    console.log('\n=============================================================');
    console.log('🔑 [PASSWORD RESET REQUEST PROCESSED]');
    console.log(`User: ${cleanEmail} (${targetUser.id})`);
    console.log(`Code: ${otpCode}`);
    console.log(`Link: ${resetUrl}`);
    console.log('=============================================================\n');

    const fullName = targetUser.user_metadata?.full_name || '';

    // 5. Attempt delivery via Supabase Auth
    try {
      const { error: sbResetError } = await supabaseAdmin.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
      });
      if (sbResetError) {
        console.warn('[AUTH] Supabase resetPasswordForEmail notice:', sbResetError.message);
      } else {
        console.log('[AUTH] Queued reset email via Supabase Auth to:', cleanEmail);
      }
    } catch (sbErr: any) {
      console.warn('[AUTH] Supabase resetPasswordForEmail error:', sbErr.message);
    }

    // 6. Attempt delivery via Resend / SMTP
    const emailResult = await sendPasswordResetEmail(cleanEmail, {
      resetUrl,
      code: otpCode,
      fullName,
    });

    const isSandboxRestricted = (emailResult as any)?.sandboxRestricted || false;

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      sandboxRestricted: isSandboxRestricted,
      otpCode: isSandboxRestricted || process.env.NODE_ENV === 'development' ? otpCode : undefined,
      resetUrl: isSandboxRestricted || process.env.NODE_ENV === 'development' ? resetUrl : undefined,
      message: isSandboxRestricted
        ? `Resend sandbox mode limits direct delivery to debayanpaul983@gmail.com. We've generated your 6-digit reset code (${otpCode}) for immediate verification.`
        : 'Password reset link and 6-digit code sent. Please check your inbox.',
    });
  } catch (err: any) {
    console.error('[AUTH] Request Reset Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
