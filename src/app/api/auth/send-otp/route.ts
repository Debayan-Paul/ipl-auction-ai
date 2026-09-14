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
    const { fullName, email, password } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (fullName || '').trim() || cleanEmail.split('@')[0];

    // 1. Check if user already exists
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.error('[AUTH] Error listing users:', listError);
      return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }

    const existingUser = usersData?.users?.find(u => u.email?.toLowerCase() === cleanEmail);

    const otpCode = generateOtpCode();
    const nonce = generateNonce();
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

    let targetUserId: string;

    if (existingUser) {
      targetUserId = existingUser.id;

      // If user already confirmed
      if (existingUser.email_confirmed_at) {
        return NextResponse.json({
          success: true,
          alreadyVerified: true,
          message: 'Account is already verified. You can sign in immediately.',
        });
      }

      // Update unverified user with new password (if provided) and new OTP
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password: password && password.length >= 6 ? password : undefined,
        user_metadata: {
          ...existingUser.user_metadata,
          full_name: cleanName || existingUser.user_metadata?.full_name,
        },
        app_metadata: {
          ...(existingUser.app_metadata || {}),
          verify_nonce: nonce,
          verify_code: otpCode,
          verify_expires: new Date(expiresAt).toISOString(),
        },
      });
    } else {
      // Create new user in Supabase Auth
      if (!password || password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }

      const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'debayanpaul629@gmail.com').toLowerCase();
      const isAdmin = cleanEmail === adminEmail;
      const initialRole = isAdmin ? 'admin' : 'free';

      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: false,
        user_metadata: {
          full_name: cleanName,
        },
        app_metadata: {
          provider: 'email',
          email_verified: false,
          verify_nonce: nonce,
          verify_code: otpCode,
          verify_expires: new Date(expiresAt).toISOString(),
        },
      });

      if (createError || !createData?.user) {
        console.error('[AUTH] User creation failed:', createError);
        return NextResponse.json({ error: createError?.message || 'Failed to create account' }, { status: 500 });
      }

      targetUserId = createData.user.id;

      // Ensure profile exists in profiles table
      try {
        await supabaseAdmin.from('profiles').upsert({
          id: targetUserId,
          email: cleanEmail,
          full_name: cleanName,
          role: initialRole,
          team_abbreviation: isAdmin ? 'KKR' : null,
        });
      } catch (profErr) {
        console.warn('[AUTH] Could not upsert profile record:', profErr);
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyToken = signToken({
      userId: targetUserId,
      email: cleanEmail,
      type: 'verify',
      nonce,
      code: otpCode,
      exp: expiresAt,
    });
    const verifyUrl = `${siteUrl}/verify-email?token=${encodeURIComponent(verifyToken)}`;

    console.log('\n=============================================================');
    console.log('⚡ [FAST OTP DISPATCHED TO INBOX]');
    console.log(`To: ${cleanEmail}`);
    console.log(`Code: ${otpCode}`);
    console.log('=============================================================\n');

    // Send email via Resend / SMTP
    await sendVerificationEmail(cleanEmail, {
      verifyUrl,
      code: otpCode,
      fullName: cleanName,
    });

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      message: `Verification OTP sent to ${cleanEmail}. Please check your inbox.`,
    });
  } catch (err: any) {
    console.error('[AUTH] Send OTP Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
