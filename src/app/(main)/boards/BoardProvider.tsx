'use client';
import { Loading, useToast } from '@umami/react-zen';
import { createContext, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { useApi, useMessages, useModified, useNavigation } from '@/components/hooks';
import { useBoardQuery } from '@/components/hooks/queries/useBoardQuery';
import type { Board, BoardParameters } from '@/lib/types';

export type LayoutGetter = () => Partial<BoardParameters> | null;

export interface BoardContextValue {
  board: Partial<Board>;
  editing: boolean;
  updateBoard: (data: Partial<Board>) => void;
  saveBoard: () => Promise<Board>;
  isPending: boolean;
  registerLayoutGetter: (getter: LayoutGetter) => void;
}

export const BoardContext = createContext<BoardContextValue>(null);

const createDefaultBoard = (): Partial<Board> => ({
  name: '',
  description: '',
  parameters: {
    rows: [{ id: uuid(), columns: [{ id: uuid(), component: null }] }],
  },
});

export function BoardProvider({
  boardId,
  editing = false,
  children,
}: {
  boardId?: string;
  editing?: boolean;
  children: ReactNode;
}) {
  const { data, isFetching, isLoading } = useBoardQuery(boardId);
  const { post, useMutation } = useApi();
  const { touch } = useModified();
  const { toast } = useToast();
  const { t, labels, messages } = useMessages();
  const { router, renderUrl, teamId } = useNavigation();

  const [board, setBoard] = useState<Partial<Board>>(data ?? createDefaultBoard());
  const layoutGetterRef = useRef<LayoutGetter | null>(null);

  const registerLayoutGetter = useCallback((getter: LayoutGetter) => {
    layoutGetterRef.current = getter;
  }, []);

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
      return post('/boards', { ...boardData, type: 'dashboard', slug: '', teamId });
    },
  });

  const updateBoard = useCallback((data: Partial<Board>) => {
    setBoard(current => ({ ...current, ...data }));
  }, []);

  const saveBoard = useCallback(async () => {
    const defaultName = t(labels.untitled);

    // Get current layout sizes from BoardBody if registered
    const layoutData = layoutGetterRef.current?.();
    const parameters = layoutData ? { ...board.parameters, ...layoutData } : board.parameters;

    const result = await mutateAsync({
      ...board,
      name: board.name || defaultName,
      parameters,
    });

    toast(t(messages.saved));
    touch('boards');

    if (board.id) {
      touch(`board:${board.id}`);
    } else if (result?.id) {
      router.push(renderUrl(`/boards/${result.id}`));
    }

    return result;
  }, [board, mutateAsync, toast, t, labels.untitled, messages.saved, touch, router, renderUrl]);

  if (boardId && isFetching && isLoading) {
    return <Loading placement="absolute" />;
  }

  return (
    <BoardContext.Provider
      value={{ board, editing, updateBoard, saveBoard, isPending, registerLayoutGetter }}
    >
      {children}
    </BoardContext.Provider>
  );
}
