import crypto from 'node:crypto';
import { startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { v4, v5, v7 } from 'uuid';

const HASH_ALGO = 'sha512';
const HASH_ENCODING = 'hex';

export function hash(...args: string[]) {
  return crypto.createHash(HASH_ALGO).update(args.join('')).digest(HASH_ENCODING);
}

export function md5(...args: string[]) {
  return crypto.createHash('md5').update(args.join('')).digest('hex');
}

export function secret() {
  return hash(process.env.APP_SECRET || process.env.DATABASE_URL);
}

export function uuid(...args: any) {
  if (args.length) {
    return v5(hash(...args, secret()), v5.DNS);
  }

  return process.env.USE_UUIDV7 ? v7() : v4();
}

export function getSalt(saltRotation: string, createdAt: Date): string {
  return hash(
    (saltRotation === 'day' ? startOfDay : saltRotation === 'week' ? startOfWeek : startOfMonth)(
      createdAt,
    ).toUTCString(),
  );
}
