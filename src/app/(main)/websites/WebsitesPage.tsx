'use client';
import { WebsitesDataTable } from '@/app/(main)/settings/websites/WebsitesDataTable';
import { useMessages, useNavigation } from '@/components/hooks';
import { Column } from '@umami/react-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { WebsiteAddButton } from '@/app/(main)/settings/websites/WebsiteAddButton';
import { Panel } from '@/components/common/Panel';

export function WebsitesPage() {
  const { teamId } = useNavigation();
  const { formatMessage, labels } = useMessages();

  return (
    <Column gap="6">
      <PageHeader title={formatMessage(labels.websites)}>
        <WebsiteAddButton teamId={teamId} />
      </PageHeader>
      <Panel>
        <WebsitesDataTable teamId={teamId} allowEdit={false} />
      </Panel>
    </Column>
  );
}
