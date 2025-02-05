import jwt from 'jsonwebtoken';
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
  } catch {
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
