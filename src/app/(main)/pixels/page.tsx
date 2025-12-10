import type { Metadata } from 'next';
import { PixelsPage } from './PixelsPage';

export default function () {
  return <PixelsPage />;
}

export const metadata: Metadata = {
  title: 'Pixels',
};
