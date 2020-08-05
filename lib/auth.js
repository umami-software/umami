import { parse } from 'cookie';
import { verifySecureToken } from './crypto';
import { AUTH_COOKIE_NAME } from './constants';

export async function verifyAuthToken(req) {
  const token = parse(req.headers.cookie || '')[AUTH_COOKIE_NAME];

  return verifySecureToken(token);
}
