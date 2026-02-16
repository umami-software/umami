'use client';
import { Loading, useToast } from '@umami/react-zen';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { BoardContext, type LayoutGetter } from '@/app/(main)/boards/BoardProvider';
import { getComponentDefinition } from '@/app/(main)/boards/boardComponentRegistry';
import { useApi, useDashboardQuery, useMessages, useModified } from '@/components/hooks';
import type { Board, BoardParameters } from '@/lib/types';

const createDefaultBoard = (): Partial<Board> => ({
  name: '',
  description: '',
  parameters: {
    rows: [{ id: uuid(), columns: [{ id: uuid(), component: null }] }],
  },
});

function sanitizeBoardParameters(parameters?: BoardParameters): BoardParameters | undefined {
  if (!parameters?.rows) {
    return parameters;
  }

  return {
    ...parameters,
    rows: parameters.rows.map(row => ({
      ...row,
      columns: row.columns.map(column => {
        if (column.component && !getComponentDefinition(column.component.type)) {
          return {
            ...column,
            component: null,
          };
        }

        return column;
      }),
    })),
  };
}

export function DashboardProvider({
  editing = false,
  children,
}: {
  editing?: boolean;
  children: ReactNode;
}) {
  const { data, isFetching, isLoading } = useDashboardQuery();
  const { post, useMutation } = useApi();
  const { touch } = useModified();
  const { toast } = useToast();
  const { t, labels, messages } = useMessages();
  const [board, setBoard] = useState<Partial<Board>>(data ?? createDefaultBoard());
  const layoutGetterRef = useRef<LayoutGetter | null>(null);

  const registerLayoutGetter = useCallback((getter: LayoutGetter) => {
    layoutGetterRef.current = getter;
  }, []);

  useEffect(() => {
    if (data) {
      setBoard({
        ...data,
        parameters: sanitizeBoardParameters(data.parameters),
      });
    }
  }, [data]);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (boardData: Partial<Board>) => {
      return post('/dashboard', boardData);
    },
  });

  const updateBoard = useCallback((data: Partial<Board>) => {
    setBoard(current => ({ ...current, ...data }));
  }, []);

  const saveBoard = useCallback(async () => {
    const dashboardName = t(labels.dashboard);
    const layoutData = layoutGetterRef.current?.();
    const parameters = sanitizeBoardParameters(
      layoutData ? { ...board.parameters, ...layoutData } : board.parameters,
    );

    const result = await mutateAsync({
      ...board,
      name: dashboardName,
      description: '',
      parameters,
    });

    toast(t(messages.saved));
    touch('dashboard');
    touch('boards');

    return result;
  }, [board, labels.dashboard, messages.saved, mutateAsync, t, toast, touch]);

  if (isFetching && isLoading) {
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
