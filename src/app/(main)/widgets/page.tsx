import type { Metadata } from 'next';
import { WidgetsPage } from './WidgetsPage';

export default function () {
  return <WidgetsPage />;
}

export const metadata: Metadata = {
  title: 'Site widgets',
};
