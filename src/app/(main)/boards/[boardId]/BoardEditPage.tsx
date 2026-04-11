'use client';
import { Column } from '@umami/react-zen';
import { BoardProvider } from '@/app/(main)/boards/BoardProvider';
import { PageBody } from '@/components/common/PageBody';
import { BoardControls } from './BoardControls';
import { BoardEditBody } from './BoardEditBody';
import { BoardDesignHeader } from './BoardEditHeader';

export function BoardDesignPage({ boardId }: { boardId: string }) {
  return (
    <BoardProvider boardId={boardId} editing>
      <PageBody>
        <Column>
          <BoardDesignHeader />
          <BoardControls />
          <BoardEditBody />
        </Column>
      </PageBody>
    </BoardProvider>
  );
}
