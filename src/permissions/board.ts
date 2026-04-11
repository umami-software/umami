import { hasPermission } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/constants';
import type { Auth } from '@/lib/types';
import { getBoard, getTeamUser } from '@/queries/prisma';

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
