'use client';
import { Column } from '@umami/react-zen';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { useMessages, useNavigation } from '@/components/hooks';
import { WebsitesOverview } from './WebsitesOverview';

export function DashboardPage() {
  const { formatMessage, labels } = useMessages();
  const { teamId } = useNavigation();

  return (
    <PageBody>
      <Column margin="2" gap="6">
        <PageHeader title={formatMessage(labels.dashboard)} />
        <WebsitesOverview teamId={teamId} />
      </Column>
    </PageBody>
  );
}
