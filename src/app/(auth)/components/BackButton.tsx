'use client';

import Link from 'next/link';
import styles from '../auth.module.css';

interface BackButtonProps {
  href?: string;
  label?: string;
}

export default function BackButton({ href = '/', label = 'Back to Home' }: BackButtonProps) {
  return (
    <Link href={href} className={styles['auth-back-button']} aria-label={label}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      <span>{label}</span>
    </Link>
  );
}
