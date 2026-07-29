import { hasPermission } from '@/lib/auth';
import { getBoardEntityIds } from '@/lib/boards';
import { PERMISSIONS } from '@/lib/constants';
import type { Auth, BoardParameters } from '@/lib/types';
import { getBoard, getTeamUser } from '@/queries/prisma';
import { canViewLink } from './link';
import { canViewPixel } from './pixel';
import { canViewWebsite } from './website';

async function checkBoardEntityAccess(check: Promise<boolean>) {
  try {
    return await check;
  } catch {
    return false;
  }
}

export async function canViewBoardEntities(
  auth: Auth,
  type: string | undefined,
  parameters: BoardParameters = {},
) {
  const { websiteIds, pixelIds, linkIds } = getBoardEntityIds({ type, parameters });
  const userOnlyAuth: Auth = { user: auth.user };
  const checks = [
    ...websiteIds.map(id => checkBoardEntityAccess(canViewWebsite(userOnlyAuth, id))),
    ...pixelIds.map(id => checkBoardEntityAccess(canViewPixel(userOnlyAuth, id))),
    ...linkIds.map(id => checkBoardEntityAccess(canViewLink(userOnlyAuth, id))),
  ];

  const results = await Promise.all(checks);

  return results.every(Boolean);
}

export async function canViewBoard({ user, shareToken }: Auth, boardId: string) {
  if (user?.isAdmin) {
    return true;
  }

  if (shareToken?.boardId === boardId) {
    return true;
  }

  if (!user) {
    return false;
  }

  const board = await getBoard(boardId);

  if (!board) {
    return false;
  }

  if (board.userId) {
    return user.id === board.userId;
  }

  if (board.teamId) {
    const teamUser = await getTeamUser(board.teamId, user.id);

    return !!teamUser;
  }

  return false;
}

export async function canUpdateBoard({ user }: Auth, boardId: string) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  const board = await getBoard(boardId);

  if (!board) {
    return false;
  }

  if (board.userId) {
    return user.id === board.userId;
  }

  if (board.teamId) {
    const teamUser = await getTeamUser(board.teamId, user.id);

    return teamUser && hasPermission(teamUser.role, PERMISSIONS.websiteUpdate);
  }

  return false;
}

export async function canDeleteBoard({ user }: Auth, boardId: string) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  const board = await getBoard(boardId);

  if (!board) {
    return false;
  }

  if (board.userId) {
    return user.id === board.userId;
  }

  if (board.teamId) {
    const teamUser = await getTeamUser(board.teamId, user.id);

    return teamUser && hasPermission(teamUser.role, PERMISSIONS.websiteDelete);
  }

  return false;
}
