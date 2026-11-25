'use client';
import { Column } from '@umami/react-zen';
import { TeamsDataTable } from '@/app/(main)/teams/TeamsDataTable';
import { TeamsHeader } from '@/app/(main)/teams/TeamsHeader';
import { PageBody } from '@/components/common/PageBody';

export function TeamsPage() {
  return (
    <PageBody>
      <Column gap="6">
        <TeamsHeader />
        <TeamsDataTable />
      </Column>
    </PageBody>
  );
}
