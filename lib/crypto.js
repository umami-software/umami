import crypto from 'crypto';
import { v5 } from 'uuid';
import bcrypt from 'bcrypt';
import { JWT, JWE, JWK } from 'jose';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const KEY = JWK.asKey(Buffer.from(secret()));

export function sha256(...args) {
  return crypto.createHash('sha256').update(args.join('')).digest('hex');
}

export function secret() {
  return sha256(process.env.HASH_SALT);
}

export function uuid(...args) {
  return v5(args.join(''), v5(process.env.HASH_SALT, v5.DNS));
}

export function random(n = 64) {
  return crypto.randomBytes(n).toString('hex');
}

export function isValidHash(s) {
  return UUID_REGEX.test(s);
}

export function checkPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload) {
  return JWT.sign(payload, KEY);
}

export async function verifyToken(token) {
  return JWT.verify(token, KEY);
}

export async function createSecureToken(payload) {
  return JWE.encrypt(await createToken(payload), KEY);
}

export async function verifySecureToken(token) {
  const result = await JWE.decrypt(token, KEY);
  return verifyToken(result.toString());
}
