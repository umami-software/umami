'use client';
import { Column } from '@umami/react-zen';
import { LinksDataTable } from '@/app/(main)/links/LinksDataTable';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useMessages, useNavigation } from '@/components/hooks';
import { LinkAddButton } from './LinkAddButton';

export function LinksPage() {
  const { formatMessage, labels } = useMessages();
  const { teamId } = useNavigation();

  return (
    <PageBody>
      <Column gap="6" margin="2">
        <PageHeader title={formatMessage(labels.links)}>
          <LinkAddButton teamId={teamId} />
        </PageHeader>
        <Panel>
          <LinksDataTable />
        </Panel>
      </Column>
    </PageBody>
  );
}
