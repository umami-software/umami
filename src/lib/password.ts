import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;
const SYSTEM_USER_ID = '41e2b680-648e-4b09-bcd7-3e2b10c06264';
const SYSTEM_USER_PASSWORD_HASH = '$2b$10$BUli0c.muyCW1ErNJc3jL.vFRFtFJWrT8/GcR4A.sUdCznaXiqFXa';

export function hashPassword(password: string, rounds = SALT_ROUNDS) {
  return bcrypt.hashSync(password, rounds);
}

export function checkPassword(password: string, passwordHash: string) {
  return bcrypt.compareSync(password, passwordHash);
}

export function hasDefaultPassword(user: { id: string; password: string } | null | undefined) {
  // Cloud accounts are not created by the seed migration.
  if (process.env.CLOUD_MODE) {
    return false;
  }

  return user?.id === SYSTEM_USER_ID && user.password === SYSTEM_USER_PASSWORD_HASH;
}
