import crypto from 'crypto';

// Secret key for HMAC signing, fallback to JWT secret or a stable server key
const SECRET = process.env.SUPABASE_JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'ipl-auction-secret-key-2026';

export interface TokenPayload {
  userId: string;
  email: string;
  type: 'reset' | 'verify';
  nonce: string;
  code?: string;
  exp: number;
}

/**
 * Generates a signed, URL-safe HMAC token
 */
export function signToken(payload: TokenPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

/**
 * Verifies and parses a signed HMAC token
 */
export function verifyToken(token: string, expectedType?: 'reset' | 'verify'): TokenPayload | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;

    const expectedSignature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
    
    // Constant time comparison to avoid timing attacks
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return null;
    }

    const payload: TokenPayload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));

    // Check expiration
    if (Date.now() > payload.exp) {
      return null;
    }

    // Check type if requested
    if (expectedType && payload.type !== expectedType) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Helper to generate a random 6-digit numeric OTP code
 */
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Helper to generate a random nonce
 */
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('hex');
}
