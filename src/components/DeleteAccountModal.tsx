'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export default function DeleteAccountModal({ isOpen, onClose, userEmail }: DeleteAccountModalProps) {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isConfirmed = confirmationInput.trim() === 'DELETE';

  const handleDelete = async () => {
    if (!isConfirmed || isDeleting) return;

    setIsDeleting(true);
    setError('');

    try {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers,
        body: JSON.stringify({ confirmation: 'DELETE' }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      // Sign out from client-side Supabase and clear Zustand state
      await supabase.auth.signOut();
      setUser(null);

      // Redirect to home page with notice
      window.location.href = '/?account_deleted=true';
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while deleting your account.');
      setIsDeleting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: 520,
          width: '100%',
          padding: '28px',
          background: 'rgba(20, 24, 33, 0.95)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          boxShadow: '0 20px 50px rgba(239, 68, 68, 0.15)',
          borderRadius: '16px',
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
            }}
          >
            ⚠️
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#ef4444', margin: 0 }}>
              Delete Account Permanently
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0, marginTop: 2 }}>
              Account: {userEmail || 'Your Account'}
            </p>
          </div>
        </div>

        {/* Warning Banner */}
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '10px',
            padding: '14px 16px',
            marginBottom: 20,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 14, color: '#f87171', marginBottom: 6 }}>
            🚨 Warning: This action cannot be undone.
          </div>
          <p style={{ fontSize: 13, color: '#fca5a5', lineHeight: 1.5, margin: 0 }}>
            Deleting your account will immediately and permanently erase all your data from our database.
          </p>
        </div>

        {/* Breakdown of consequences */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            What will be removed:
          </div>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>
              <strong>Franchise & Manager Profile:</strong> Your team associations, custom colors, and auction preferences will be erased.
            </li>
            <li>
              <strong>Pro Subscription:</strong> Any active Pro membership will be forfeited immediately without refund.
            </li>
            <li>
              <strong>Saved Comparisons:</strong> All head-to-head comparisons, notes, and activity history will be deleted.
            </li>
            <li>
              <strong>Active Sessions:</strong> You will be logged out of all devices immediately.
            </li>
          </ul>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#fca5a5',
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {/* Confirmation Input */}
        <div style={{ marginBottom: 24 }}>
          <label
            htmlFor="confirm-delete"
            style={{ display: 'block', fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}
          >
            To confirm this deletion, type <strong style={{ color: '#ef4444' }}>DELETE</strong> below:
          </label>
          <input
            id="confirm-delete"
            type="text"
            className="input"
            placeholder="DELETE"
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            disabled={isDeleting}
            style={{
              borderColor: isConfirmed ? '#ef4444' : 'rgba(255,255,255,0.15)',
              fontWeight: 700,
              letterSpacing: '1px',
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isDeleting}
            style={{ border: '1px solid rgba(255,255,255,0.15)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            style={{
              background: isConfirmed ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'rgba(239, 68, 68, 0.3)',
              color: '#ffffff',
              border: 'none',
              cursor: isConfirmed && !isDeleting ? 'pointer' : 'not-allowed',
              fontWeight: 700,
              padding: '10px 20px',
              borderRadius: '8px',
              boxShadow: isConfirmed ? '0 4px 14px rgba(239, 68, 68, 0.4)' : 'none',
            }}
          >
            {isDeleting ? 'Deleting Account...' : 'Permanently Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
