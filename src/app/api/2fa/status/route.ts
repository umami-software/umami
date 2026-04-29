import prisma from '@/lib/prisma';
import { parseRequest } from '@/lib/request';
import { json } from '@/lib/response';

export async function GET(request: Request) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const userId = auth.user.id;

  const twoFactor = await prisma.client.twoFactorAuth.findUnique({ where: { userId } });
  const isEnabled = twoFactor?.isEnabled ?? false;

  // Globally required
  const globalSetting = await prisma.client.appSetting.findUnique({
    where: { key: 'twoFactorRequiredGlobal' },
  });
  const isGlobalRequired = globalSetting?.value === 'true';
  if (isGlobalRequired) return json({ isEnabled, isRequired: true, requiredReason: 'global' });

  // Required for this user
  const userRecord = await prisma.client.user.findUnique({
    where: { id: userId },
    select: { twoFactorRequired: true },
  });
  const isUserRequired = userRecord?.twoFactorRequired ?? false;
  if (isUserRequired) return json({ isEnabled, isRequired: true, requiredReason: 'user' });

  // Required for this user's teams
  const userTeams = await prisma.client.teamUser.findMany({ where: { userId } });
  const teamIds = userTeams.map(t => t.teamId);
  const teamsWithRequirement = teamIds.length
    ? await prisma.client.team.findMany({
        where: { id: { in: teamIds }, twoFactorRequired: true },
      })
    : [];
  const isTeamRequired = teamsWithRequirement.length > 0;
  if (isTeamRequired) return json({ isEnabled, isRequired: true, requiredReason: 'team' });

  return json({ isEnabled, isRequired: false, requiredReason: null });
}
