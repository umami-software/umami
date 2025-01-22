import { z } from 'zod';
import { canCreateTeamWebsite, canCreateWebsite, checkAuth } from 'lib/auth';
import { json, badRequest, unauthorized } from 'lib/response';
import { uuid } from 'lib/crypto';
import { checkRequest } from 'lib/request';
import { createWebsite, getUserWebsites } from 'queries';
import { pagingParams } from 'lib/schema';

export async function GET(request: Request) {
  const schema = z.object({ ...pagingParams });

  const { query, error } = await checkRequest(request, schema);

  if (error) {
    return badRequest(error);
  }

  const auth = await checkAuth(request);

  if (!auth) {
    return unauthorized();
  }

  const websites = await getUserWebsites(auth.user.userId, query);

  return json(websites);
}

export async function POST(request: Request) {
  const schema = z.object({
    name: z.string().max(100),
    domain: z.string().max(500),
    shareId: z.string().max(50).nullable(),
    teamId: z.string().nullable(),
  });

  const { body, error } = await checkRequest(request, schema);

  if (error) {
    return badRequest(error);
  }

  const auth = await checkAuth(request);

  if (!auth) {
    return unauthorized();
  }

  const { name, domain, shareId, teamId } = body;

  if ((teamId && !(await canCreateTeamWebsite(auth, teamId))) || !(await canCreateWebsite(auth))) {
    return unauthorized();
  }

  const data: any = {
    id: uuid(),
    createdBy: auth.user.userId,
    name,
    domain,
    shareId,
    teamId,
  };

  if (!teamId) {
    data.userId = auth.user.userId;
  }

  const website = await createWebsite(data);

  return json(website);
}
