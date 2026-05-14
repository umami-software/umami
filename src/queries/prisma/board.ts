import type { Prisma } from '@/generated/prisma/client';
import { BOARD_TYPES } from '@/lib/boards';
import prisma from '@/lib/prisma';
import { sanitizeSortFilters } from '@/lib/sort';
import type { QueryFilters } from '@/lib/types';

const BOARD_SORT_FIELDS = ['name', 'description', 'type', 'createdAt'] as const;

export async function findBoard(criteria: Prisma.BoardFindUniqueArgs) {
  return prisma.client.board.findUnique(criteria);
}

export async function getBoard(boardId: string) {
  return findBoard({
    where: {
      id: boardId,
    },
  });
}

export async function getBoards(criteria: Prisma.BoardFindManyArgs, filters: QueryFilters = {}) {
  const sortFilters = sanitizeSortFilters(filters, BOARD_SORT_FIELDS);
  const { search } = sortFilters;
  const { getSearchParameters, pagedQuery } = prisma;

  const where: Prisma.BoardWhereInput = {
    ...criteria.where,
    ...getSearchParameters(search, [{ name: 'contains' }, { description: 'contains' }]),
  };

  return pagedQuery('board', { ...criteria, where }, sortFilters);
}

export async function getUserBoards(userId: string, filters?: QueryFilters) {
  return getBoards(
    {
      where: {
        userId,
        type: {
          not: BOARD_TYPES.dashboard,
        },
      },
    },
    filters,
  );
}

export async function getTeamBoards(teamId: string, filters?: QueryFilters) {
  return getBoards(
    {
      where: {
        teamId,
        type: {
          not: BOARD_TYPES.dashboard,
        },
      },
    },
    filters,
  );
}

export async function createBoard(data: Prisma.BoardUncheckedCreateInput) {
  return prisma.client.board.create({ data });
}

export async function updateBoard(boardId: string, data: any) {
  return prisma.client.board.update({ where: { id: boardId }, data });
}

export async function deleteBoard(boardId: string) {
  return prisma.client.board.delete({ where: { id: boardId } });
}
