import { z } from 'zod';
import { getAuthResponseUser } from '@/lib/auth-response';
import { parseRequest } from '@/lib/request';
import { badRequest, conflict, json, serverError, withNoStore } from '@/lib/response';
import { redeemTeamInvite, TEAM_INVITE_ERROR_CODES, TeamInviteError } from '@/lib/team-invite';
import { teamInviteRepository } from '@/queries/prisma';

const noStore = withNoStore;

export async function POST(request: Request) {
  const schema = z.object({
    token: z.string().min(1).max(512),
  });
  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return noStore(error());
  }

  try {
    const { membership, team } = await redeemTeamInvite(
      { token: body.token, userId: auth.user.id },
      { repository: teamInviteRepository },
    );
    const user = await getAuthResponseUser(auth.user);

    return noStore(
      json({
        team: { id: team.id, name: team.name },
        membership,
        user,
      }),
    );
  } catch (error) {
    if (error instanceof TeamInviteError) {
      if (error.code === TEAM_INVITE_ERROR_CODES.alreadyTeamMember) {
        return noStore(conflict({ message: 'User is already a team member.', code: error.code }));
      }

      return noStore(
        badRequest({ message: 'Invalid invitation.', code: TEAM_INVITE_ERROR_CODES.invalid }),
      );
    }

    return noStore(serverError(error));
  }
}
