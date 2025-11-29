'use client';
import { Column } from '@umami/react-zen';
import { BoardHeader } from '@/app/(main)/boards/[boardId]/BoardHeader';
import { PageBody } from '@/components/common/PageBody';
import { useMessages } from '@/components/hooks';

export function BoardPage() {
  const { formatMessage, labels } = useMessages();

  return (
    <PageBody>
      <Column margin="2">
        <BoardHeader />
      </Column>
    </PageBody>
  );
}
