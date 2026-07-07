import { isGroupDescendant } from '@/lib/websiteTree';
import type { WebsiteGroup } from '@/generated/prisma/client';
import { getAllWebsiteGroupsForOwner, getWebsiteGroup } from '@/queries/prisma/websiteGroup';

export async function validateWebsiteGroupOwnership({
  groupId,
  userId,
  teamId,
}: {
  groupId: string;
  userId?: string | null;
  teamId?: string | null;
}) {
  const group = await getWebsiteGroup(groupId);

  if (!group) {
    return { valid: false as const, message: 'Group not found.' };
  }

  if (teamId) {
    if (group.teamId !== teamId) {
      return { valid: false as const, message: 'Group does not belong to this team.' };
    }
  } else if (group.userId !== userId) {
    return { valid: false as const, message: 'Group does not belong to this user.' };
  }

  return { valid: true as const, group };
}

export async function validateWebsiteGroupParent({
  parentId,
  groupId,
  userId,
  teamId,
}: {
  parentId: string | null | undefined;
  groupId?: string;
  userId?: string | null;
  teamId?: string | null;
}) {
  if (!parentId) {
    return { valid: true as const, parentId: null };
  }

  const validation = await validateWebsiteGroupOwnership({ groupId: parentId, userId, teamId });

  if (!validation.valid) {
    return validation;
  }

  if (groupId && parentId === groupId) {
    return { valid: false as const, message: 'Group cannot be its own parent.' };
  }

  if (groupId) {
    const groups = await getAllWebsiteGroupsForOwner({ userId, teamId });
    const groupsMap = new Map(groups.map(group => [group.id, group]));

    if (isGroupDescendant(parentId, groupId, groupsMap)) {
      return { valid: false as const, message: 'Group cannot be moved into its own descendant.' };
    }
  }

  return { valid: true as const, parentId };
}

export function getOwnerFromGroup(group: WebsiteGroup) {
  return {
    userId: group.userId,
    teamId: group.teamId,
  };
}
