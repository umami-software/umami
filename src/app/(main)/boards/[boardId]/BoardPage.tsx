'use client';
import { Column } from '@umami/react-zen';
import { BoardBody } from '@/app/(main)/boards/[boardId]/BoardBody';
import { BoardHeader } from '@/app/(main)/boards/[boardId]/BoardHeader';
import { BoardProvider } from '@/app/(main)/boards/BoardProvider';
import { PageBody } from '@/components/common/PageBody';

export function BoardPage({ boardId }: { boardId: string }) {
  return (
    <BoardProvider boardId={boardId}>
      <PageBody>
        <Column>
          <BoardHeader />
          <BoardBody />
        </Column>
      </PageBody>
    </BoardProvider>
  );
}
