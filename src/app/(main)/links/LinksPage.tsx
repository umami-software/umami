'use client';
import { PageBody } from '@/components/common/PageBody';
import { Column } from '@umami/react-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { LinkAddButton } from './LinkAddButton';
import { useMessages, useNavigation } from '@/components/hooks';
import { LinksDataTable } from '@/app/(main)/links/LinksDataTable';
import { Panel } from '@/components/common/Panel';

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
