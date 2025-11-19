import { parseRequest } from '@/lib/request';
import { json } from '@/lib/response';
import { getAllUserTeams, getUserPreferences } from '@/queries/prisma';

export async function POST(request: Request) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const teams = await getAllUserTeams(auth.user.id);
  const preferences = await getUserPreferences(auth.user.id);

  return json({ ...auth.user, teams, preferences });
}
