'use client';
import { Column } from '@umami/react-zen';
import { IconLabel } from '@/components/common/IconLabel';
import { LinkButton } from '@/components/common/LinkButton';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useMessages } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { BoardsDataTable } from './BoardsDataTable';

export function BoardsPage() {
  const { t, labels } = useMessages();

  return (
    <PageBody>
      <Column margin="2">
        <PageHeader title={t(labels.boards)}>
          <LinkButton href="/boards/create" variant="primary">
            <IconLabel icon={<Plus />} label={t(labels.addBoard)} />
          </LinkButton>
        </PageHeader>
        <Panel>
          <BoardsDataTable />
        </Panel>
      </Column>
    </PageBody>
  );
}
