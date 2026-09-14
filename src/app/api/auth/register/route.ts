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

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (fullName || '').trim() || cleanEmail.split('@')[0];

    // 1. Check if user already exists
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (!listError && existingUsers?.users) {
      const exists = existingUsers.users.some(u => u.email?.toLowerCase() === cleanEmail);
      if (exists) {
        return NextResponse.json({ error: 'An account with this email already exists. Please sign in.' }, { status: 400 });
      }
    }

    // 2. Generate verification tokens
    const nonce = generateNonce();
    const otpCode = generateOtpCode();
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

    // 3. Create user in Supabase Auth with custom metadata
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: false, // Custom verification flow
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

    const newUser = createData.user;

    // 4. Ensure profile exists in profiles table
    const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'debayanpaul629@gmail.com').toLowerCase();
    const isAdmin = cleanEmail === adminEmail;
    const initialRole = isAdmin ? 'admin' : 'free';

    try {
      await supabaseAdmin.from('profiles').upsert({
        id: newUser.id,
        email: cleanEmail,
        full_name: cleanName,
        role: initialRole,
        team_abbreviation: isAdmin ? 'KKR' : null,
      });
    } catch (profErr) {
      console.warn('[AUTH] Could not upsert profile record:', profErr);
    }

    // 5. Generate verification token
    const verifyToken = signToken({
      userId: newUser.id,
      email: cleanEmail,
      type: 'verify',
      nonce,
      code: otpCode,
      exp: expiresAt,
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyUrl = `${siteUrl}/verify-email?token=${encodeURIComponent(verifyToken)}`;

    console.log('\n=============================================================');
    console.log('✉️ [CUSTOM EMAIL VERIFICATION DISPATCHED]');
    console.log(`User: ${cleanEmail}`);
    console.log(`Code: ${otpCode}`);
    console.log(`Verification URL: ${verifyUrl}`);
    console.log('=============================================================\n');

    // 6. Send verification email
    await sendVerificationEmail(cleanEmail, {
      verifyUrl,
      code: otpCode,
      fullName: cleanName,
    });

    const isDev = process.env.NODE_ENV !== 'production';

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      message: 'Account created! Please check your email to verify your account.',
      devVerifyUrl: isDev ? verifyUrl : undefined,
      devCode: isDev ? otpCode : undefined,
    });
  } catch (err: any) {
    console.error('[AUTH] Register Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
