'use client';
import { Column } from '@umami/react-zen';
import { BoardBody } from '@/app/(main)/boards/[boardId]/BoardBody';
import { BoardHeader } from '@/app/(main)/boards/[boardId]/BoardHeader';
import { BoardProvider } from '@/app/(main)/boards/BoardProvider';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { PageBody } from '@/components/common/PageBody';
import { useBoard } from '@/components/hooks';

export function BoardPage({ boardId, editing = false }: { boardId?: string; editing?: boolean }) {
  return (
    <BoardProvider boardId={boardId} editing={editing}>
      <PageBody>
        <Column>
          <BoardHeader />
          <BoardControls />
          <BoardBody />
        </Column>
      </PageBody>
    </BoardProvider>
  );
}

function BoardControls() {
  const { board } = useBoard();
  const websiteId = board?.parameters?.websiteId;

  if (!websiteId) {
    return null;
  }

  return <WebsiteControls websiteId={websiteId} allowCompare={true} />;
}
