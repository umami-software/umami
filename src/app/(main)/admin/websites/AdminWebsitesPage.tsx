'use client';
import { AdminWebsitesDataTable } from './AdminWebsitesDataTable';
import { Column } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';

export function AdminWebsitesPage() {
  const { formatMessage, labels } = useMessages();

  return (
    <Column gap="6" margin="2">
      <PageHeader title={formatMessage(labels.websites)} />
      <Panel>
        <AdminWebsitesDataTable />
      </Panel>
    </Column>
  );
}
