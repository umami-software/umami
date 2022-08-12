import crypto from 'crypto';
import { v4, v5, validate } from 'uuid';
import bcrypt from 'bcryptjs';
import { JWT, JWE, JWK } from 'jose';
import { startOfMonth } from 'date-fns';

const SALT_ROUNDS = 10;
const KEY = key();
const ROTATING_SALT = hash(startOfMonth(new Date()).toUTCString());
const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function key(value) {
  return JWK.asKey(Buffer.from(secret(value)));
}

export function hash(...args) {
  return crypto.createHash('sha512').update(args.join('')).digest('hex');
}

export function secret(secret = process.env.HASH_SALT || process.env.DATABASE_URL) {
  return hash(secret);
}

export function salt() {
  return v5(hash(secret(), ROTATING_SALT), v5.DNS);
}

export function uuid(...args) {
  if (!args.length) return v4();

  return v5(args.join(''), salt());
}

export function isValidUuid(s) {
  return validate(s);
}

export function getRandomChars(n) {
  let s = '';
  for (let i = 0; i < n; i++) {
    s += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return s;
}

export function hashPassword(password) {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

export function checkPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export async function createToken(payload) {
  return JWT.sign(payload, KEY);
}

export async function parseToken(token, key = KEY) {
  try {
    return JWT.verify(token, key);
  } catch {
    return null;
  }
}

export async function createSecureToken(payload, key = KEY) {
  return JWE.encrypt(await createToken(payload), key);
}

export async function parseSecureToken(token, key = KEY) {
  try {
    const result = await JWE.decrypt(token, key);

    return parseToken(result.toString(), key);
  } catch {
    return null;
  }
}
