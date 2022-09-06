import { v4, v5 } from 'uuid';
import { startOfMonth } from 'date-fns';
import { hash } from 'next-basics';

export function secret() {
  return hash(process.env.HASH_SALT || process.env.DATABASE_URL);
}

export function salt() {
  const ROTATING_SALT = hash(startOfMonth(new Date()).toUTCString());

  return hash([secret(), ROTATING_SALT]);
}

export function uuid(...args) {
  if (!args.length) return v4();

  return v5(hash([...args, salt()]), v5.DNS);
}
