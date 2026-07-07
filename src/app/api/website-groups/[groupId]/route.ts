import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { badRequest, json, ok, unauthorized } from '@/lib/response';
import { validateWebsiteGroupParent } from '@/lib/websiteGroupValidation';
import {
  canDeleteWebsiteGroup,
  canUpdateWebsiteGroup,
  canViewWebsiteGroup,
} from '@/permissions/websiteGroup';
import {
  deleteWebsiteGroup,
  getWebsiteGroup,
  updateWebsiteGroup,
} from '@/queries/prisma/websiteGroup';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { groupId } = await params;

  if (!(await canViewWebsiteGroup(auth, groupId))) {
    return unauthorized();
  }

  const group = await getWebsiteGroup(groupId);

  return json(group);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const schema = z.object({
    name: z.string().max(100).optional(),
    parentId: z.uuid().nullable().optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { groupId } = await params;
  const { name, parentId } = body;

  if (!(await canUpdateWebsiteGroup(auth, groupId))) {
    return unauthorized();
  }

  const currentGroup = await getWebsiteGroup(groupId);

  if (!currentGroup) {
    return badRequest({ message: 'Group not found.' });
  }

  if (parentId !== undefined) {
    const parentValidation = await validateWebsiteGroupParent({
      parentId,
      groupId,
      userId: currentGroup.userId,
      teamId: currentGroup.teamId,
    });

    if (!parentValidation.valid) {
      return badRequest({ message: parentValidation.message });
    }
  }

  const group = await updateWebsiteGroup(groupId, {
    ...(name !== undefined && { name }),
    ...(parentId !== undefined && { parentId }),
  });

  return json(group);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { groupId } = await params;

  if (!(await canDeleteWebsiteGroup(auth, groupId))) {
    return unauthorized();
  }

  const group = await getWebsiteGroup(groupId);

  if (!group) {
    return badRequest({ message: 'Group not found.' });
  }

  await deleteWebsiteGroup(groupId);

  return ok();
}
