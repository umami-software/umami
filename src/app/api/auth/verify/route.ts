import { addTeamBillingStatus } from '@/lib/load';
import { parseRequest } from '@/lib/request';
import { json } from '@/lib/response';
import { getAllUserTeams } from '@/queries/prisma';

export async function POST(request: Request) {
  const { auth, error } = await parseRequest(request, null, { allowTwoFactorSetup: true });

  if (error) {
    return error();
  }

  const teams = await addTeamBillingStatus(await getAllUserTeams(auth.user.id));

  return json({ ...auth.user, passwordChangeRequired: !!auth.passwordChangeRequired, teams });
}
