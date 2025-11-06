import { z } from 'zod';
import { json, badRequest, notFound } from '@/lib/response';
import { parseRequest } from '@/lib/request';
import { ROLES } from '@/lib/constants';
import { createTeamUser, findTeam, getTeamUser } from '@/queries/prisma';

export async function POST(request: Request) {
  const schema = z.object({
    accessCode: z.string().max(50),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { accessCode } = body;

  const team = await findTeam({
    where: {
      accessCode,
    },
  });

  if (!team) {
    return notFound({ message: 'Team not found.', code: 'team-not-found' });
  }

  const teamUser = await getTeamUser(team.id, auth.user.id);

  if (teamUser) {
    return badRequest({ message: 'User is already a team member.' });
  }

  const user = await createTeamUser(auth.user.id, team.id, ROLES.teamMember);

  return json(user);
}
