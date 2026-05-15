import type { Metadata } from 'next';
import { getPixel } from '@/queries/prisma';
import { PixelEditPage } from './PixelEditPage';

export default async function ({ params }: { params: Promise<{ pixelId: string }> }) {
  const { pixelId } = await params;
  const pixel = await getPixel(pixelId);

  if (!pixel || pixel.deletedAt) {
    return null;
  }

  return <PixelEditPage pixelId={pixelId} />;
}

export const metadata: Metadata = {
  title: 'Edit Pixel',
};
