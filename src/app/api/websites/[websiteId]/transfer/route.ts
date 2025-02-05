import { z } from 'zod';
import { canTransferWebsiteToTeam, canTransferWebsiteToUser } from '@/lib/auth';
import { updateWebsite } from '@/queries';
import { parseRequest } from '@/lib/request';
import { badRequest, unauthorized, json } from '@/lib/response';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    userId: z.string().uuid().optional(),
    teamId: z.string().uuid().optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const { userId, teamId } = body;

  if (userId) {
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

  return badRequest();
}
