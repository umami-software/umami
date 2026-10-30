import prisma from '@/lib/prisma';
import { parseRequest } from '@/lib/request';
import { forbidden, notFound, ok } from '@/lib/response';
import { isTwoFactorConfigured } from '@/lib/two-factor/crypto';
import { isTwoFactorRequired } from '@/lib/two-factor/requirement';
import { deleteSecurityKey, getUserSecurityKeyCount } from '@/queries/prisma/securityKey';

export async function DELETE(request: Request, { params }: { params: Promise<{ keyId: string }> }) {
  if (process.env.CLOUD_MODE) {
    return notFound();
  }

  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { keyId } = await params;
  const userId = auth.user.id;

  // Keep at least one second factor while two-factor authentication is required
  if (isTwoFactorConfigured() && (await isTwoFactorRequired(userId))) {
    const twoFactor = await prisma.client.twoFactorAuth.findUnique({ where: { userId } });

    if (!twoFactor?.isEnabled && (await getUserSecurityKeyCount(userId)) <= 1) {
      return forbidden({
        code: 'security-key-error-remove-not-allowed',
        message: 'Two-factor authentication is required and this is the last security key',
      });
    }
  }

  const count = await deleteSecurityKey(keyId, userId);

  if (!count) {
    return notFound();
  }

  return ok();
}
