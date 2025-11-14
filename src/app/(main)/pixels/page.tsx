import { PixelsPage } from './PixelsPage';
import { Metadata } from 'next';

export default function () {
  return <PixelsPage />;
}

export const metadata: Metadata = {
  title: 'Pixels',
};
