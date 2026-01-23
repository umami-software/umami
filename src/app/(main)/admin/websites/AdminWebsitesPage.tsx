'use client';
import { Column } from '@umami/react-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useMessages } from '@/components/hooks';
import { AdminWebsitesDataTable } from './AdminWebsitesDataTable';

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
