'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RazorpayCheckoutProps {
  amount: number; // in INR
  description: string;
  buttonText?: string;
  className?: string;
  style?: React.CSSProperties;
  onSuccess?: () => void;
}

export default function RazorpayCheckout({
  amount,
  description,
  buttonText,
  className,
  style,
  onSuccess,
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    const res = await loadRazorpayScript();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    try {
      // 1. Create Order via our API
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'INR' }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'IPL Auction Arena',
        description,
        order_id: orderData.id,
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          
          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            alert('Payment Successful! Welcome to Pro.');
            if (onSuccess) onSuccess();
            router.refresh();
          } else {
            alert('Payment Verification Failed: ' + verifyData.error);
          }
        },
        prefill: {
          name: 'User',
          email: 'user@example.com',
        },
        theme: {
          color: '#00ffff',
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={className || "btn btn-primary"}
      style={style || { width: '100%', marginTop: 'var(--space-4)' }}
    >
      {loading ? 'Processing...' : (buttonText || `Upgrade Now (₹${amount})`)}
    </button>
  );
}
