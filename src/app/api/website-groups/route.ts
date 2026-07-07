import { z } from 'zod';
import { uuid } from '@/lib/crypto';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { badRequest, json, unauthorized } from '@/lib/response';
import { pagingParams, searchParams, sortingParams } from '@/lib/schema';
import { validateWebsiteGroupParent } from '@/lib/websiteGroupValidation';
import {
  canCreateTeamWebsiteGroup,
  canCreateWebsiteGroup,
} from '@/permissions/websiteGroup';
import { canViewTeam } from '@/permissions';
import { createWebsiteGroup, getTeamWebsiteGroups, getUserWebsiteGroups } from '@/queries/prisma/websiteGroup';

export async function GET(request: Request) {
  const schema = z.object({
    ...pagingParams,
    ...searchParams,
    ...sortingParams,
    teamId: z.uuid().optional(),
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const filters = await getQueryFilters(query);

  if (query.teamId) {
    if (!(await canViewTeam(auth, query.teamId))) {
      return unauthorized();
    }

    return json(await getTeamWebsiteGroups(query.teamId, filters));
  }

  return json(await getUserWebsiteGroups(auth.user.id, filters));
}

export async function POST(request: Request) {
  const schema = z.object({
    name: z.string().max(100),
    parentId: z.uuid().nullable().optional(),
    teamId: z.uuid().nullable().optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { name, parentId, teamId } = body;

  if (
    (teamId && !(await canCreateTeamWebsiteGroup(auth, teamId))) ||
    !(await canCreateWebsiteGroup(auth))
  ) {
    return unauthorized();
  }

  const parentValidation = await validateWebsiteGroupParent({
    parentId,
    userId: teamId ? null : auth.user.id,
    teamId,
  });

  if (!parentValidation.valid) {
    return badRequest({ message: parentValidation.message });
  }

  const group = await createWebsiteGroup({
    id: uuid(),
    name,
    parentId: parentValidation.parentId,
    teamId: teamId ?? null,
    userId: teamId ? null : auth.user.id,
    createdBy: auth.user.id,
  });

  return json(group);
}
