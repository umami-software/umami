'use client';
import { Column } from '@umami/react-zen';
import Link from 'next/link';
import { PixelEditForm } from '@/app/(main)/pixels/PixelEditForm';
import { PixelProvider } from '@/app/(main)/pixels/PixelProvider';
import { PixelShareForm } from '@/app/(main)/pixels/[pixelId]/PixelShareForm';
import { Panel } from '@/components/common/Panel';
import { IconLabel } from '@/components/common/IconLabel';
import { PageHeader } from '@/components/common/PageHeader';
import { useMessages, useNavigation, usePixel } from '@/components/hooks';
import { ArrowLeft, Grid2x2 } from '@/components/icons';

export function PixelEditPage({ pixelId }: { pixelId: string }) {
  return (
    <PixelProvider pixelId={pixelId}>
      <Column margin="2" width="100%" maxWidth="800px" style={{ marginInline: 'auto' }}>
        <PixelEditHeader />
        <Column gap="6">
          <Panel>
            <PixelEditForm pixelId={pixelId} />
          </Panel>
          <Panel>
            <PixelShareForm pixelId={pixelId} />
          </Panel>
        </Column>
      </Column>
    </PixelProvider>
  );
}

function PixelEditHeader() {
  const pixel = usePixel();
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();

  return (
    <>
      <Column marginTop="6">
        <Link href={renderUrl(`/pixels/${pixel.id}`)}>
          <IconLabel icon={<ArrowLeft />} label={t(labels.pixel)} />
        </Link>
      </Column>
      <PageHeader title={pixel.name} icon={<Grid2x2 />} />
    </>
  );
}
