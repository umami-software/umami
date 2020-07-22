import crypto from 'crypto';
import { v5 as uuid, v4 } from 'uuid';
import Cryptr from 'cryptr';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const cryptr = new Cryptr(hash(process.env.HASH_SALT, process.env.DATABASE_URL));

export function md5(s) {
  return crypto.createHash('md5').update(s).digest('hex');
}

export function hash(...args) {
  return uuid(args.join(''), md5(process.env.HASH_SALT));
}

export function validHash(s) {
  return UUID_REGEX.test(s);
}

export function encrypt(s) {
  return cryptr.encrypt(s);
}

export function decrypt(s) {
  return cryptr.decrypt(s);
}

export function random() {
  return v4();
}
