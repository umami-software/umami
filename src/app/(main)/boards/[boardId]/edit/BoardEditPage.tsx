'use client';
import { Column } from '@umami/react-zen';
import Link from '@/components/common/Link';
import { BoardEditForm } from '@/app/(main)/boards/BoardEditForm';
import { BoardShareDialog } from '@/app/(main)/boards/[boardId]/BoardShareDialog';
import { IconLabel } from '@/components/common/IconLabel';
import { Panel } from '@/components/common/Panel';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { useBoardQuery, useMessages, useNavigation } from '@/components/hooks';
import { ArrowLeft, LayoutDashboard } from '@/components/icons';

export function BoardEditPage({ boardId }: { boardId: string }) {
  const { data: board } = useBoardQuery(boardId);
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();

  return (
    <PageBody>
      <Column
        margin="2"
        width="100%"
        maxWidth="800px"
        style={{ marginInline: 'auto' }}
      >
        <>
          <Column marginTop="6">
            <Link href={renderUrl(`/boards/${boardId}`)}>
              <IconLabel icon={<ArrowLeft />} label="Board" />
            </Link>
          </Column>
          <PageHeader
            title={board?.name || t(labels.untitled)}
            description={board?.description}
            icon={<LayoutDashboard />}
          />
        </>
        <Column gap="6">
          <Panel>
            <BoardEditForm boardId={boardId} />
          </Panel>
          <Panel>
            <BoardShareDialog boardId={boardId} />
          </Panel>
        </Column>
      </Column>
    </PageBody>
  );
}
