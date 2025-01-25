import { z } from 'zod';
import { unauthorized, json, badRequest, notFound } from 'lib/response';
import { canCreateTeam, checkAuth } from 'lib/auth';
import { checkRequest } from 'lib/request';
import { ROLES } from 'lib/constants';
import { createTeamUser, findTeam, getTeamUser } from 'queries';

export async function POST(request: Request) {
  const schema = z.object({
    accessCode: z.string().max(50),
  });

  const { body, error } = await checkRequest(request, schema);

  if (error) {
    return badRequest(error);
  }

  const auth = await checkAuth(request);

  if (!auth || !(await canCreateTeam(auth))) {
    return unauthorized();
  }

  const { accessCode } = body;

  const team = await findTeam({
    where: {
      accessCode,
    },
  });

  if (!team) {
    return notFound('Team not found.');
  }

  const teamUser = await getTeamUser(team.id, auth.user.id);

  if (teamUser) {
    return badRequest('User is already a team member.');
  }

  const user = await createTeamUser(auth.user.id, team.id, ROLES.teamMember);

  return json(user);
}
