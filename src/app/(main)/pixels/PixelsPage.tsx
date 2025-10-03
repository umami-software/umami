'use client';
import { PageBody } from '@/components/common/PageBody';
import { Column } from '@umami/react-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { PixelAddButton } from './PixelAddButton';
import { useMessages, useNavigation } from '@/components/hooks';
import { PixelsDataTable } from './PixelsDataTable';
import { Panel } from '@/components/common/Panel';

export function PixelsPage() {
  const { formatMessage, labels } = useMessages();
  const { teamId } = useNavigation();

  return (
    <PageBody>
      <Column gap="6" margin="2">
        <PageHeader title={formatMessage(labels.pixels)}>
          <PixelAddButton teamId={teamId} />
        </PageHeader>
        <Panel>
          <PixelsDataTable />
        </Panel>
      </Column>
    </PageBody>
  );
}
