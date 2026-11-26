'use client';
import { Column } from '@umami/react-zen';
import { TeamsDataTable } from '@/app/(main)/teams/TeamsDataTable';
import { TeamsHeader } from '@/app/(main)/teams/TeamsHeader';

export function TeamsSettingsPage() {
  return (
    <Column>
      <TeamsHeader />
      <TeamsDataTable />
    </Column>
  );
}
