import prisma from '@/lib/prisma';
import { parseRequest } from '@/lib/request';
import { json } from '@/lib/response';
import { isTwoFactorConfigured } from '@/lib/two-factor/crypto';

export async function GET(request: Request) {
  const { auth, error } = await parseRequest(request);

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

  const globalSetting = await prisma.client.appSetting.findUnique({
    where: { key: 'twoFactorRequiredGlobal' },
  });
  const isGlobalRequired = globalSetting?.value === 'true';

  // 2FA cannot be set up without an encryption key, so it is never required
  if (!isTwoFactorConfigured()) {
    return json({
      isEnabled,
      isRequired: false,
      requiredReason: null,
      isConfigured: false,
      globalRequired: isGlobalRequired,
    });
  }
  if (isGlobalRequired) {
    return json({
      isEnabled,
      isRequired: true,
      requiredReason: 'global',
      isConfigured: true,
      globalRequired: true,
    });
  }

  // Required for this user
  const userRecord = await prisma.client.user.findUnique({
    where: { id: userId },
    select: { twoFactorRequired: true },
  });
  const isUserRequired = userRecord?.twoFactorRequired ?? false;
  if (isUserRequired) {
    return json({
      isEnabled,
      isRequired: true,
      requiredReason: 'user',
      isConfigured: true,
      globalRequired: false,
    });
  }

  // Required for this user's teams
  const userTeams = await prisma.client.teamUser.findMany({ where: { userId } });
  const teamIds = userTeams.map(t => t.teamId);
  const teamsWithRequirement = teamIds.length
    ? await prisma.client.team.findMany({
        where: { id: { in: teamIds }, twoFactorRequired: true },
      })
    : [];
  const isTeamRequired = teamsWithRequirement.length > 0;
  if (isTeamRequired) {
    return json({
      isEnabled,
      isRequired: true,
      requiredReason: 'team',
      isConfigured: true,
      globalRequired: false,
    });
  }

  return json({
    isEnabled,
    isRequired: false,
    requiredReason: null,
    isConfigured: true,
    globalRequired: false,
  });
}
