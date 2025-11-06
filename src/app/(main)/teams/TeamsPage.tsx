'use client';
import { TeamsDataTable } from '@/app/(main)/teams/TeamsDataTable';
import { TeamsHeader } from '@/app/(main)/teams/TeamsHeader';
import { Column } from '@umami/react-zen';
import { Panel } from '@/components/common/Panel';
import { PageBody } from '@/components/common/PageBody';

export function TeamsPage() {
  return (
    <PageBody>
      <Column gap="6">
        <TeamsHeader />
        <Panel>
          <TeamsDataTable />
        </Panel>
      </Column>
    </PageBody>
  );
}
