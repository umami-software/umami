'use client';
import { TeamsDataTable } from './TeamsDataTable';
import { TeamsHeader } from './TeamsHeader';
import { Column } from '@umami/react-zen';

export function TeamsSettingsPage() {
  return (
    <Column gap>
      <TeamsHeader />
      <TeamsDataTable />
    </Column>
  );
}
