import { z } from 'zod';
import { canTransferWebsiteToTeam, canTransferWebsiteToUser, checkAuth } from 'lib/auth';
import { updateWebsite } from 'queries';
import { checkRequest } from 'lib/request';
import { badRequest, unauthorized, json } from 'lib/response';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    userId: z.string().uuid().optional(),
    teamId: z.string().uuid().optional(),
  });

  const { body, error } = await checkRequest(request, schema);

  if (error) {
    return badRequest(error);
  }

  const { websiteId } = await params;
  const { userId, teamId } = body;

  const auth = await checkAuth(request);

  if (!auth) {
    return unauthorized();
  } else if (userId) {
    if (!(await canTransferWebsiteToUser(auth, websiteId, userId))) {
      return unauthorized();
    }

    const website = await updateWebsite(websiteId, {
      userId,
      teamId: null,
    });

    return json(website);
  } else if (teamId) {
    if (!(await canTransferWebsiteToTeam(auth, websiteId, teamId))) {
      return unauthorized();
    }

    const website = await updateWebsite(websiteId, {
      userId: null,
      teamId,
    });

    return json(website);
  }
}
