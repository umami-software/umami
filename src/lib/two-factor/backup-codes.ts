import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

const BACKUP_CODE_COUNT = 10;
const BCRYPT_ROUNDS = 10;

export async function generateBackupCodes(): Promise<{
  plaintext: Array<string>;
  hashed: Array<string>;
}> {
  const plaintext = Array.from(
    { length: BACKUP_CODE_COUNT },
    () =>
      randomBytes(5).toString('hex').toUpperCase() +
      '-' +
      randomBytes(5).toString('hex').toUpperCase(),
  );
  const hashed = await Promise.all(plaintext.map(code => bcrypt.hash(code, BCRYPT_ROUNDS)));
  return { plaintext, hashed };
}

export async function verifyBackupCode(
  inputCode: string,
  storedHashes: Array<string>,
): Promise<number | null> {
  for (let i = 0; i < storedHashes.length; i++) {
    const match = await bcrypt.compare(inputCode.toUpperCase(), storedHashes[i]);
    if (match) return i;
  }
  return null;
}
