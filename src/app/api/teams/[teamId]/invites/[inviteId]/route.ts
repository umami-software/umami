import { parseRequest } from '@/lib/request';
import { notFound, ok, unauthorized, withNoStore } from '@/lib/response';
import { canUpdateTeam } from '@/permissions';
import { getTeam, revokeTeamInvite } from '@/queries/prisma';

const noStore = withNoStore;

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ teamId: string; inviteId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return noStore(error());
  }

  const { teamId, inviteId } = await params;
  const team = await getTeam(teamId);

  if (!team || team.deletedAt) {
    return noStore(notFound({ message: 'Team not found.' }));
  }

  if (!(await canUpdateTeam(auth, teamId))) {
    return noStore(unauthorized({ message: 'You must be the owner/manager of this team.' }));
  }

  if (!(await revokeTeamInvite(teamId, inviteId))) {
    return noStore(notFound({ message: 'Active invitation not found.' }));
  }

  return noStore(ok());
}
