'use client';
import { AdminTeamsDataTable } from './AdminTeamsDataTable';
import { Column } from '@umami/react-zen';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useMessages } from '@/components/hooks';

export function AdminTeamsPage() {
  const { formatMessage, labels } = useMessages();

  return (
    <Column gap>
      <SectionHeader title={formatMessage(labels.teams)} />
      <AdminTeamsDataTable />
    </Column>
  );
}
