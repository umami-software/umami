'use client';
import { Column } from '@umami/react-zen';
import { BoardProvider } from '@/app/(main)/boards/BoardProvider';
import { PageBody } from '@/components/common/PageBody';
import { BoardControls } from './BoardControls';
import { BoardEditBody } from './BoardEditBody';
import { BoardEditHeader } from './BoardEditHeader';

export function BoardEditPage({ boardId }: { boardId?: string }) {
  return (
    <BoardProvider boardId={boardId} editing>
      <PageBody>
        <Column>
          <BoardEditHeader />
          <BoardControls />
          <BoardEditBody />
        </Column>
      </PageBody>
    </BoardProvider>
  );
}
