import crypto from 'crypto';
import { v4, v5 } from 'uuid';
import { startOfMonth } from 'date-fns';
import { hash } from 'next-basics';

export function secret() {
  return hash(process.env.APP_SECRET || process.env.DATABASE_URL);
}

export function salt() {
  const ROTATING_SALT = hash(startOfMonth(new Date()).toUTCString());

  return hash(secret(), ROTATING_SALT);
}

export function uuid(...args) {
  if (!args.length) return v4();

  return v5(hash(...args, salt()), v5.DNS);
}

export function md5(...args) {
  return crypto.createHash('md5').update(args.join('')).digest('hex');
}
