import prisma from '@/lib/prisma';
import { parseRequest } from '@/lib/request';
import { json } from '@/lib/response';
import { isTwoFactorConfigured } from '@/lib/two-factor/crypto';
import { getTwoFactorRequiredReason } from '@/lib/two-factor/policy';

export async function GET(request: Request) {
  const { auth, error } = await parseRequest(request, null, { allowTwoFactorSetup: true });

  if (error) {
    return error();
  }

  if (process.env.CLOUD_MODE) {
    return json({
      isEnabled: false,
      isRequired: false,
      requiredReason: null,
      isConfigured: false,
      globalRequired: false,
    });
  }

  const userId = auth.user.id;

  const twoFactor = await prisma.client.twoFactorAuth.findUnique({ where: { userId } });
  const isEnabled = twoFactor?.isEnabled ?? false;

  const requiredReason = await getTwoFactorRequiredReason(userId);
  const globalRequired = requiredReason === 'global';

  // 2FA cannot be set up without an encryption key, so it is never required
  if (!isTwoFactorConfigured()) {
    return json({
      isEnabled,
      isRequired: false,
      requiredReason: null,
      isConfigured: false,
      globalRequired,
    });
  }

  return json({
    isEnabled,
    isRequired: !!requiredReason,
    requiredReason,
    isConfigured: true,
    globalRequired,
  });
}
