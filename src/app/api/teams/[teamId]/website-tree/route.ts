import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canViewTeam } from '@/permissions';
import { getWebsiteTreeForOwner } from '@/queries/prisma/websiteGroup';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { auth, error } = await parseRequest(request, z.object({}));

  if (error) {
    return error();
  }

  const { teamId } = await params;

  if (!(await canViewTeam(auth, teamId))) {
    return unauthorized();
  }

  const tree = await getWebsiteTreeForOwner({ teamId });

  return json(tree);
}
