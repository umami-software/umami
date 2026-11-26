import type { Metadata } from 'next';
import { getPixel } from '@/queries/prisma';
import { PixelMetricsPage } from './PixelMetricsPage';

export default async function ({ params }: { params: Promise<{ pixelId: string }> }) {
  const { pixelId } = await params;
  const pixel = await getPixel(pixelId);

  if (!pixel || pixel?.deletedAt) {
    return null;
  }

  return <PixelMetricsPage pixelId={pixelId} />;
}

export const metadata: Metadata = {
  title: 'Pixel',
};
