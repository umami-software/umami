import type { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

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
  const { search } = filters;
  const { getSearchParameters, pagedQuery } = prisma;

  const where: Prisma.BoardWhereInput = {
    ...criteria.where,
    ...getSearchParameters(search, [{ name: 'contains' }, { description: 'contains' }]),
  };

  return pagedQuery('board', { ...criteria, where }, filters);
}

export async function getUserBoards(userId: string, filters?: QueryFilters) {
  return getBoards(
    {
      where: {
        userId,
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
