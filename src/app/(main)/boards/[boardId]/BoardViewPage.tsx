'use client';
import { Column } from '@umami/react-zen';
import { BoardProvider } from '@/app/(main)/boards/BoardProvider';
import { PageBody } from '@/components/common/PageBody';
import { BoardControls } from './BoardControls';
import { BoardViewBody } from './BoardViewBody';
import { BoardViewHeader } from './BoardViewHeader';

export function BoardViewPage({
  boardId,
  showActions = true,
  showControls = true,
  showEntityBadges = true,
}: {
  boardId: string;
  showActions?: boolean;
  showControls?: boolean;
  showEntityBadges?: boolean;
}) {
  return (
    <BoardProvider boardId={boardId}>
      <PageBody>
        <Column>
          <BoardViewHeader showActions={showActions} showEntityBadge={showEntityBadges} />
          {showControls && <BoardControls />}
          <BoardViewBody showEntityBadges={showEntityBadges} />
        </Column>
      </PageBody>
    </BoardProvider>
  );
}
