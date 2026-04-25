import { parseRequest } from '@/lib/request';
import { badRequest, json } from '@/lib/response';
import { encryptSecret } from '@/lib/two-factor/crypto';
import {
  generateOtpAuthUri,
  generateQrCodeDataUrl,
  generateTotpSecret,
} from '@/lib/two-factor/totp';
import prisma from '@/lib/prisma';
import { getUser } from '@/queries/prisma/user';

export async function POST(request: Request) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const userId = auth.user.id;
  const user = await getUser(userId);

  if (!user) {
    return badRequest({ message: 'User not found' });
  }

  const secret = generateTotpSecret();
  const encryptedSecret = encryptSecret(secret);
  const otpAuthUri = generateOtpAuthUri(secret, user.username);
  const qrCodeDataUrl = await generateQrCodeDataUrl(otpAuthUri);

  await prisma.client.twoFactorAuth.upsert({
    where: { userId },
    update: { secret: encryptedSecret, isEnabled: false },
    create: { userId, secret: encryptedSecret, isEnabled: false },
  });

  /*
  `manualKey` is intentionally plaintext as the user needs it once for manual entry.
  The encrypted copy in DB is what matters for long-term storage.
   */
  return json({ qrCodeDataUrl, manualKey: secret });
}
