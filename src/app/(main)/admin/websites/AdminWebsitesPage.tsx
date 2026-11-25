'use client';
import { Column } from '@umami/react-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { useMessages } from '@/components/hooks';
import { AdminWebsitesDataTable } from './AdminWebsitesDataTable';

export function AdminWebsitesPage() {
  const { t, labels } = useMessages();

  return (
    <Column gap="6" margin="2">
      <PageHeader title={t(labels.websites)} />
      <AdminWebsitesDataTable />
    </Column>
  );
}
