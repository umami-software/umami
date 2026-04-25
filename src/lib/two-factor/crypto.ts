import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

/** Loads and validates the 256-bit encryption key from TWO_FACTOR_ENCRYPTION_KEY. */
function getKey(): Buffer {
  const hex = process.env.TWO_FACTOR_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error('TWO_FACTOR_ENCRYPTION_KEY is missing or invalid');
  }
  return Buffer.from(hex, 'hex');
}

/** Encrypts a TOTP secret using AES-256-GCM. Returns `ciphertext:iv:authTag` as hex. */
export function encryptSecret(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${encrypted.toString('hex')}:${iv.toString('hex')}:${authTag.toString('hex')}`;
}

/** Decrypts a TOTP secret previously encrypted by {@link encryptSecret}. */
export function decryptSecret(stored: string): string {
  const key = getKey();
  const [ciphertextHex, ivHex, authTagHex] = stored.split(':');
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertextHex, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}
