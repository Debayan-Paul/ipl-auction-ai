import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { signToken, generateNonce, generateOtpCode } from '@/lib/auth-tokens';
import { sendVerificationEmail } from '@/lib/email';

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
    if (listError || !usersData?.users) {
      return NextResponse.json({ error: 'Failed to search for account' }, { status: 500 });
    }

    const user = usersData.users.find(u => u.email?.toLowerCase() === cleanEmail);
    if (!user) {
      // Don't leak account existence, just return success
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a new verification link has been sent.',
      });
    }

    if (user.email_confirmed_at) {
      return NextResponse.json({
        success: true,
        message: 'This account has already been verified. You can sign in immediately.',
        alreadyVerified: true,
      });
    }

    // 2. Generate fresh token and code
    const nonce = generateNonce();
    const otpCode = generateOtpCode();
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

    // 3. Update app_metadata
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      app_metadata: {
        ...(user.app_metadata || {}),
        verify_nonce: nonce,
        verify_code: otpCode,
        verify_expires: new Date(expiresAt).toISOString(),
      },
    });

    const verifyToken = signToken({
      userId: user.id,
      email: cleanEmail,
      type: 'verify',
      nonce,
      code: otpCode,
      exp: expiresAt,
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyUrl = `${siteUrl}/verify-email?token=${encodeURIComponent(verifyToken)}`;

    console.log('\n=============================================================');
    console.log('🔄 [VERIFICATION LINK RESENT]');
    console.log(`User: ${cleanEmail}`);
    console.log(`Code: ${otpCode}`);
    console.log(`URL: ${verifyUrl}`);
    console.log('=============================================================\n');

    const fullName = user.user_metadata?.full_name || cleanEmail.split('@')[0];
    await sendVerificationEmail(cleanEmail, {
      verifyUrl,
      code: otpCode,
      fullName,
    });

    const isDev = process.env.NODE_ENV !== 'production';

    return NextResponse.json({
      success: true,
      message: 'New verification email sent!',
      devVerifyUrl: isDev ? verifyUrl : undefined,
      devCode: isDev ? otpCode : undefined,
    });
  } catch (err: any) {
    console.error('[AUTH] Resend Verification Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
