'use client';
import { Column } from '@umami/react-zen';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useMessages } from '@/components/hooks';
import { PaymentProvidersAddButton } from './PaymentProvidersAddButton';
import { PaymentProvidersDataTable } from './PaymentProvidersDataTable';

export function PaymentProvidersPage() {
  const { t, labels } = useMessages();

  return (
    <PageBody>
      <Column margin="2">
        <PageHeader title={t(labels.paymentProviders)}>
          <PaymentProvidersAddButton />
        </PageHeader>
        <Panel>
          <PaymentProvidersDataTable />
        </Panel>
      </Column>
    </PageBody>
  );
}
