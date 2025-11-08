'use client';
import { Column } from '@umami/react-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { useMessages } from '@/components/hooks';
import { PageBody } from '@/components/common/PageBody';

export function DashboardPage() {
  const { formatMessage, labels } = useMessages();

  return (
    <PageBody>
      <Column margin="2">
        <PageHeader title={formatMessage(labels.dashboard)}></PageHeader>
      </Column>
    </PageBody>
  );
}
