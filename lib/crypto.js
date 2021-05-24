import crypto from 'crypto';
import { v4, v5, validate } from 'uuid';
import bcrypt from 'bcryptjs';
import { JWT, JWE, JWK } from 'jose';
import { startOfMonth } from 'date-fns';

const SALT_ROUNDS = 10;
const KEY = JWK.asKey(Buffer.from(secret()));
const ROTATING_SALT = hash(startOfMonth(new Date()).toUTCString());
const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function hash(...args) {
  return crypto.createHash('sha512').update(args.join('')).digest('hex');
}

export function secret() {
  return hash(process.env.HASH_SALT);
}

export function salt() {
  return v5([secret(), ROTATING_SALT].join(''), v5.DNS);
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

export async function parseToken(token) {
  try {
    return JWT.verify(token, KEY);
  } catch {
    return null;
  }
}

export async function createSecureToken(payload) {
  return JWE.encrypt(await createToken(payload), KEY);
}

export async function parseSecureToken(token) {
  try {
    const result = await JWE.decrypt(token, KEY);

    return parseToken(result.toString());
  } catch {
    return null;
  }
}
