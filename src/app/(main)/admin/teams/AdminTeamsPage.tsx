'use client';
import { AdminTeamsDataTable } from './AdminTeamsDataTable';
import { Column } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';

export function AdminTeamsPage() {
  const { formatMessage, labels } = useMessages();

  return (
    <Column gap="6" margin="2">
      <PageHeader title={formatMessage(labels.teams)} />
      <Panel>
        <AdminTeamsDataTable />
      </Panel>
    </Column>
  );
}
