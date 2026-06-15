import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { decrypt, encrypt } from '@/lib/crypto';

export function createToken(payload: any, secret: any, options?: any) {
  return jwt.sign(payload, secret, options);
}

export function parseToken(token: string, secret: any) {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

export function createSecureToken(payload: any, secret: any, options?: any) {
  return encrypt(createToken(payload, secret, options), secret);
}

export function parseSecureToken(token: string, secret: any) {
  try {
    return jwt.verify(decrypt(token, secret), secret);
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw error;
    }
    return null;
  }
}

export async function parseAuthToken(req: Request, secret: string) {
  try {
    const token = req.headers.get('authorization')?.split(' ')?.[1];

    return parseSecureToken(token as string, secret);
  } catch {
    return null;
  }
}

export function refreshTokensEnabled() {
  return process.env.AUTH_REFRESH_TOKEN_ENABLED === 'true';
}

export function getAccessExpiry() {
  if (refreshTokensEnabled) {
    return process.env.AUTH_ACCESS_TOKEN_EXPIRY || '15m';
  }

  return undefined;
}

export function getRefreshExpiry() {
  const expiryDays = process.env.AUTH_REFRESH_TOKEN_EXPIRY_DAYS || '30';

  if (refreshTokensEnabled && !Number.isNaN(expiryDays)) {
    return Number(expiryDays);
  }

  return undefined;
}