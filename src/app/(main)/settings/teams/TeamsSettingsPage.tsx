'use client';
import { TeamsDataTable } from './TeamsDataTable';
import { TeamsHeader } from './TeamsHeader';
import { Column } from '@umami/react-zen';
import { Panel } from '@/components/common/Panel';

export function TeamsSettingsPage() {
  return (
    <Column gap="6">
      <TeamsHeader />
      <Panel>
        <TeamsDataTable />
      </Panel>
    </Column>
  );
}
