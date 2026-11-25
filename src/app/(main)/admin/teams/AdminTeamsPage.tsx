'use client';
import { Column } from '@umami/react-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { useMessages } from '@/components/hooks';
import { TeamsAddButton } from '../../teams/TeamsAddButton';
import { AdminTeamsDataTable } from './AdminTeamsDataTable';

export function AdminTeamsPage() {
  const { t, labels } = useMessages();

  const handleSave = () => {};

  return (
    <Column gap="6" margin="2">
      <PageHeader title={t(labels.teams)}>
        <TeamsAddButton onSave={handleSave} isAdmin={true} />
      </PageHeader>
      <AdminTeamsDataTable />
    </Column>
  );
}
