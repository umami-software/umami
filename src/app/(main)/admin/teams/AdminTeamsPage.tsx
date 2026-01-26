'use client';
import { Column } from '@umami/react-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useMessages } from '@/components/hooks';
import { TeamsAddButton } from '../../teams/TeamsAddButton';
import { AdminTeamsDataTable } from './AdminTeamsDataTable';

export function AdminTeamsPage() {
  const { formatMessage, labels } = useMessages();

  const handleSave = () => {};

  return (
    <Column gap="6" margin="2">
      <PageHeader title={formatMessage(labels.teams)}>
        <TeamsAddButton onSave={handleSave} isAdmin={true} />
      </PageHeader>
      <Panel>
        <AdminTeamsDataTable />
      </Panel>
    </Column>
  );
}
