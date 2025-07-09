'use client';
import { AdminWebsitesDataTable } from './AdminWebsitesDataTable';
import { Column } from '@umami/react-zen';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useMessages } from '@/components/hooks';

export function AdminWebsitesPage() {
  const { formatMessage, labels } = useMessages();

  return (
    <Column gap>
      <SectionHeader title={formatMessage(labels.websites)} />
      <AdminWebsitesDataTable />
    </Column>
  );
}
