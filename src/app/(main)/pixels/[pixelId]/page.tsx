import type { Metadata } from 'next';
import { getPixel } from '@/queries/prisma';
import { PixelPage } from './PixelPage';

export default async function ({ params }: { params: { pixelId: string } }) {
  const { pixelId } = await params;
  const pixel = await getPixel(pixelId);

  if (!pixel || pixel?.deletedAt) {
    return null;
  }

  return <PixelPage pixelId={pixelId} />;
}

export const metadata: Metadata = {
  title: 'Pixel',
};
