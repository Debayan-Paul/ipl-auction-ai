import type { PlayerRole } from './types';

/**
 * Format a number to Indian currency (₹ Crores / Lakhs)
 */
export function formatCurrency(amountCr: number): string {
  if (amountCr >= 1) {
    return `₹${amountCr.toFixed(2)} Cr`;
  }
  return `₹${(amountCr * 100).toFixed(0)} L`;
}

/**
 * Format large numbers with K/M suffixes
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Format a decimal to percentage
 */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Get initials from a name (for avatar placeholder)
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Generate slug from player name
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Get color class for player role
 */
export function getRoleBadgeClass(role: PlayerRole): string {
  const map: Record<PlayerRole, string> = {
    Batsman: 'badge-batting',
    Bowler: 'badge-bowling',
    'All-Rounder': 'badge-allround',
    'Wicket-Keeper': 'badge-keeper',
  };
  return map[role] || 'badge-primary';
}

/**
 * Get role emoji
 */
export function getRoleEmoji(role: PlayerRole): string {
  const map: Record<PlayerRole, string> = {
    Batsman: '🏏',
    Bowler: '🎯',
    'All-Rounder': '⚡',
    'Wicket-Keeper': '🧤',
  };
  return map[role] || '🏏';
}

/**
 * Calculate age from DOB
 */
export function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Country to flag emoji
 */
export function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    India: '🇮🇳',
    Australia: '🇦🇺',
    England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'South Africa': '🇿🇦',
    'New Zealand': '🇳🇿',
    'West Indies': '🏝️',
    'Sri Lanka': '🇱🇰',
    Bangladesh: '🇧🇩',
    Afghanistan: '🇦🇫',
    Pakistan: '🇵🇰',
    Zimbabwe: '🇿🇼',
    Nepal: '🇳🇵',
    Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    Ireland: '🇮🇪',
    Netherlands: '🇳🇱',
    USA: '🇺🇸',
  };
  return flags[country] || '🏳️';
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Generate a random hex string for tokens
 */
export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Time ago formatter
 */
export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Classnames utility (simple cn)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
