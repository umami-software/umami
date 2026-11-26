import type { Metadata } from 'next';
import { OverviewPage } from './OverviewPage';

export default function () {
  return <OverviewPage />;
}

export const metadata: Metadata = {
  title: 'Overview',
};
