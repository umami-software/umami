import { z } from 'zod';
import { ENTITY_TYPE } from '@/lib/constants';
import { uuid } from '@/lib/crypto';
import { fetchAccount, fetchTeam } from '@/lib/load';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { pagingParams, searchParams, sortingParams } from '@/lib/schema';
import { getCloudWebsiteLimit } from '@/lib/subscription';
import { canCreateTeamWebsite, canCreateWebsite } from '@/permissions';
import { createShare, createWebsite, getTeamWebsiteCount, getWebsiteCount } from '@/queries/prisma';
import { getAllUserWebsitesIncludingTeamAccess, getUserWebsites } from '@/queries/prisma/website';

export async function GET(request: Request) {
  const schema = z.object({
    ...pagingParams,
    ...searchParams,
    ...sortingParams,
    includeTeams: z.string().optional(),
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const userId = auth.user.id;

  const filters = await getQueryFilters(query);

  if (query.includeTeams) {
    return json(await getAllUserWebsitesIncludingTeamAccess(userId, filters));
  }

  return json(await getUserWebsites(userId, filters));
}

export async function POST(request: Request) {
  const schema = z.object({
    name: z.string().max(100),
    domain: z.string().max(500),
    shareId: z.string().max(50).nullable().optional(),
    teamId: z.uuid().nullable().optional(),
    id: z.uuid().nullable().optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { id, name, domain, shareId, teamId } = body;

  if (process.env.CLOUD_MODE) {
    const account = teamId ? await fetchTeam(teamId) : await fetchAccount(auth.user.id);
    const websiteLimit = getCloudWebsiteLimit(account);

    if (websiteLimit !== null) {
      const count = teamId
        ? await getTeamWebsiteCount(teamId)
        : await getWebsiteCount(auth.user.id);

      if (count >= websiteLimit) {
        return unauthorized({ message: 'Website limit reached.' });
      }
    }
  }

  if ((teamId && !(await canCreateTeamWebsite(auth, teamId))) || !(await canCreateWebsite(auth))) {
    return unauthorized();
  }

  const data: any = {
    id: id ?? uuid(),
    createdBy: auth.user.id,
    name,
    domain,
    teamId,
  };

  if (!teamId) {
    data.userId = auth.user.id;
  }

  const website = await createWebsite(data);

  const share = shareId
    ? await createShare({
        id: uuid(),
        entityId: website.id,
        shareType: ENTITY_TYPE.website,
        name: website.name,
        slug: shareId,
        parameters: { overview: true, events: true },
      })
    : null;

  return json({
    ...website,
    shareId: share?.slug ?? null,
  });
}
