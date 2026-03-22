import { z } from 'zod';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { pagingParams, searchParams } from '@/lib/schema';
import { canViewTeam } from '@/permissions';
import { getLinkClickCounts, getTeamLinks } from '@/queries/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const schema = z.object({
    ...pagingParams,
    ...searchParams,
  });
  const { teamId } = await params;
  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  if (!(await canViewTeam(auth, teamId))) {
    return unauthorized();
  }

  const filters = await getQueryFilters(query);

  const links = await getTeamLinks(teamId, filters);

  const linkIds = links.data.map((link: any) => link.id);
  const clickCounts = await getLinkClickCounts(linkIds);
  links.data = links.data.map((link: any) => ({
    ...link,
    clicks: clickCounts[link.id] || 0,
  }));

  return json(links);
}
