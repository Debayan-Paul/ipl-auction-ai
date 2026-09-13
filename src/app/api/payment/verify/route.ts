import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServiceSupabase } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, user_id } = await request.json();

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Update subscription in Supabase
    const supabase = await createServiceSupabase();
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year validity

    const { error } = await supabase.from('subscriptions').upsert({
      user_id,
      tier: 'pro',
      status: 'active',
      starts_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    }, { onConflict: 'user_id' });

    if (error) {
      console.error('Supabase subscription update error:', error);
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }

    // Update profile role
    await supabase.from('profiles').update({ role: 'pro' }).eq('id', user_id);

    return NextResponse.json({ success: true, expires_at: expiresAt.toISOString() });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
