import { z } from 'zod';
import { getRandomChars } from 'next-basics';
import { unauthorized, json, badRequest } from 'lib/response';
import { canCreateTeam, checkAuth } from 'lib/auth';
import { uuid } from 'lib/crypto';
import { checkRequest } from 'lib/request';
import { createTeam } from 'queries';

export async function POST(request: Request) {
  const schema = z.object({
    name: z.string().max(50),
  });

  const { body, error } = await checkRequest(request, schema);

  if (error) {
    return badRequest(error);
  }

  const auth = await checkAuth(request);

  if (!auth || !(await canCreateTeam(auth))) {
    return unauthorized();
  }

  const { name } = body;

  const team = await createTeam(
    {
      id: uuid(),
      name,
      accessCode: `team_${getRandomChars(16)}`,
    },
    auth.user.userId,
  );

  return json(team);
}
