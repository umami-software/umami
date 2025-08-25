import { PixelPage } from './PixelPage';
import { Metadata } from 'next';

export default async function ({ params }: { params: Promise<{ pixelId: string }> }) {
  const { pixelId } = await params;

  return <PixelPage pixelId={pixelId} />;
}

export const metadata: Metadata = {
  title: 'Pixel',
};
