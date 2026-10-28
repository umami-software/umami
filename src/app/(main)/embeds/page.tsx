import type { Metadata } from 'next';
import { EmbedsPage } from './EmbedsPage';

export default function () {
  return <EmbedsPage />;
}

export const metadata: Metadata = {
  title: 'Stats embeds',
};
