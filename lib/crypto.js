import { startOfMonth } from 'date-fns';
import { hash } from 'next-basics';

export function secret() {
  return hash(process.env.APP_SECRET || process.env.DATABASE_URL);
}

export function salt() {
  const ROTATING_SALT = hash(startOfMonth(new Date()).toUTCString());

  return hash(secret(), ROTATING_SALT);
}
