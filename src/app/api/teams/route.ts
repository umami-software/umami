import { z } from 'zod';
import { getRandomChars } from '@/lib/crypto';
import { unauthorized, json } from '@/lib/response';
import { canCreateTeam } from '@/lib/auth';
import { uuid } from '@/lib/crypto';
import { parseRequest } from '@/lib/request';
import { createTeam } from '@/queries';

export async function POST(request: Request) {
  const schema = z.object({
    name: z.string().max(50),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  if (!(await canCreateTeam(auth))) {
    return unauthorized();
  }

  const { name } = body;

  const team = await createTeam(
    {
      id: uuid(),
      name,
      accessCode: `team_${getRandomChars(16)}`,
    },
    auth.user.id,
  );

  return json(team);
}
