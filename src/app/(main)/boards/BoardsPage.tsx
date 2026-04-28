'use client';
import { Column } from '@umami/react-zen';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useMessages } from '@/components/hooks';
import { BoardAddButton } from './BoardAddButton';
import { BoardsDataTable } from './BoardsDataTable';

export function BoardsPage() {
  const { t, labels } = useMessages();

  return (
    <PageBody>
      <Column margin="2">
        <PageHeader title={t(labels.boards)}>
          <BoardAddButton />
        </PageHeader>
        <Panel>
          <BoardsDataTable />
        </Panel>
      </Column>
    </PageBody>
  );
}
