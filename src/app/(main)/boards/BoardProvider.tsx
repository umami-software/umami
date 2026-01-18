'use client';
import { Loading, useToast } from '@umami/react-zen';
import { createContext, type ReactNode, useCallback, useEffect, useState } from 'react';
import { useApi, useMessages, useModified, useNavigation } from '@/components/hooks';
import { useBoardQuery } from '@/components/hooks/queries/useBoardQuery';
import type { Board } from '@/lib/types';

export interface BoardContextValue {
  board: Partial<Board>;
  updateBoard: (data: Partial<Board>) => void;
  saveBoard: () => Promise<Board>;
  isPending: boolean;
}

export const BoardContext = createContext<BoardContextValue>(null);

const defaultBoard: Partial<Board> = {
  name: '',
  description: '',
  parameters: { rows: [] },
};

export function BoardProvider({ boardId, children }: { boardId?: string; children: ReactNode }) {
  const { data, isFetching, isLoading } = useBoardQuery(boardId);
  const { post, useMutation } = useApi();
  const { touch } = useModified();
  const { toast } = useToast();
  const { formatMessage, labels, messages } = useMessages();
  const { router, renderUrl } = useNavigation();

  const [board, setBoard] = useState<Partial<Board>>(data ?? defaultBoard);

  useEffect(() => {
    if (data) {
      setBoard(data);
    }
  }, [data]);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (boardData: Partial<Board>) => {
      if (boardData.id) {
        return post(`/boards/${boardData.id}`, boardData);
      }
      return post('/boards', { ...boardData, type: 'dashboard', slug: '' });
    },
  });

  const updateBoard = useCallback((data: Partial<Board>) => {
    setBoard(current => ({ ...current, ...data }));
  }, []);

  const saveBoard = useCallback(async () => {
    const defaultName = formatMessage(labels.untitled);
    const result = await mutateAsync({ ...board, name: board.name || defaultName });

    toast(formatMessage(messages.saved));
    touch('boards');

    if (board.id) {
      touch(`board:${board.id}`);
    } else if (result?.id) {
      router.push(renderUrl(`/boards/${result.id}`));
    }

    return result;
  }, [
    board,
    mutateAsync,
    toast,
    formatMessage,
    labels.untitled,
    messages.saved,
    touch,
    router,
    renderUrl,
  ]);

  if (boardId && isFetching && isLoading) {
    return <Loading placement="absolute" />;
  }

  return (
    <BoardContext.Provider value={{ board, updateBoard, saveBoard, isPending }}>
      {children}
    </BoardContext.Provider>
  );
}
