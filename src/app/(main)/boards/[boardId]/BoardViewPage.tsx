'use client';
import { Column } from '@umami/react-zen';
import { BoardProvider } from '@/app/(main)/boards/BoardProvider';
import { PageBody } from '@/components/common/PageBody';
import { BoardControls } from './BoardControls';
import { BoardViewBody } from './BoardViewBody';
import { BoardViewHeader } from './BoardViewHeader';

export function BoardViewPage({ boardId }: { boardId: string }) {
  return (
    <BoardProvider boardId={boardId}>
      <PageBody>
        <Column>
          <BoardViewHeader />
          <BoardControls />
          <BoardViewBody />
        </Column>
      </PageBody>
    </BoardProvider>
  );
}
