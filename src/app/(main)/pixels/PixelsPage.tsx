'use client';
import { PageBody } from '@/components/common/PageBody';
import { Column } from '@umami/react-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { PixelAddButton } from './PixelAddButton';
import { useMessages } from '@/components/hooks';

export function PixelsPage() {
  const { formatMessage, labels } = useMessages();

  return (
    <PageBody>
      <Column>
        <PageHeader title={formatMessage(labels.pixels)}>
          <PixelAddButton />
        </PageHeader>
      </Column>
    </PageBody>
  );
}
