import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export function hashPassword(password: string, rounds = SALT_ROUNDS) {
  return bcrypt.hashSync(password, rounds);
}

export function checkPassword(password: string, passwordHash: string) {
  return bcrypt.compareSync(password, passwordHash);
}

// A hash of a random value, made on first use. Compared against when there is no user, so a failed login takes as
// long whether or not the username exists.
let dummyHash: string;

export function checkUserPassword(password: string, passwordHash?: string | null) {
  dummyHash ??= bcrypt.hashSync(crypto.randomUUID(), SALT_ROUNDS);
  const matches = bcrypt.compareSync(password, passwordHash || dummyHash);
  return !!passwordHash && matches;
}
