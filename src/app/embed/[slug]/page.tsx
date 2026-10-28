import type { Metadata } from 'next';
import { EmbedPage } from './EmbedPage';

export default function () {
  return <EmbedPage />;
}

export const metadata: Metadata = {
  title: 'Analytics',
  robots: { index: false, follow: false },
};
