import { generateSecret, generateURI, verify } from 'otplib';
import qrcode from 'qrcode';

export function generateTotpSecret(): string {
  return generateSecret();
}

export function generateOtpAuthUri(secret: string, userEmail: string): string {
  return generateURI({
    issuer: 'Umami',
    label: userEmail,
    secret,
  });
}

export async function generateQrCodeDataUrl(otpAuthUri: string): Promise<string> {
  return qrcode.toDataURL(otpAuthUri, { errorCorrectionLevel: 'H' });
}

export async function verifyTotp(token: string, secret: string): Promise<boolean> {
  const result = await verify({ secret, token });
  return result.valid;
}
