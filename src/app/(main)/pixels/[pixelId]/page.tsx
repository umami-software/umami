import { PixelPage } from './PixelPage';
import { Metadata } from 'next';

export default function ({ params }: { params: { pixelId: string } }) {
  const { pixelId } = params;

  return <PixelPage pixelId={pixelId} />;
}

export const metadata: Metadata = {
  title: 'Pixel',
};
