'use client';
import { Column } from '@umami/react-zen';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useMessages } from '@/components/hooks';
import { BillingsAddButton } from './BillingsAddButton';
import { BillingsDataTable } from './BillingsDataTable';

export function BillingsPage() {
  const { t, labels } = useMessages();

  return (
    <PageBody>
      <Column margin="2">
        <PageHeader title={t(labels.billing)}>
          <BillingsAddButton />
        </PageHeader>
        <Panel>
          <BillingsDataTable />
        </Panel>
      </Column>
    </PageBody>
  );
}
