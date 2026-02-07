'use client';
import { Column } from '@umami/react-zen';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { useMessages } from '@/components/hooks';

export function DashboardPage() {
  const { t, labels } = useMessages();

  return (
    <PageBody>
      <Column margin="2">
        <PageHeader title={t(labels.dashboard)}></PageHeader>
      </Column>
    </PageBody>
  );
}
