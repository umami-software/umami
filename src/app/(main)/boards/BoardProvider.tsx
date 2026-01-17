'use client';
import { Loading } from '@umami/react-zen';
import { createContext, type ReactNode } from 'react';
import { useBoardQuery } from '@/components/hooks/queries/useBoardQuery';
import type { Board } from '@/generated/prisma/client';

export const BoardContext = createContext<Board>(null);

export function BoardProvider({ boardId, children }: { boardId: string; children: ReactNode }) {
  const { data: board, isFetching, isLoading } = useBoardQuery(boardId);

  if (isFetching && isLoading) {
    return <Loading placement="absolute" />;
  }

  return <BoardContext.Provider value={board}>{children}</BoardContext.Provider>;
}
