import type { Metadata } from 'next';
import { AppearancePage } from './AppearancePage';

export default function () {
  return <AppearancePage />;
}

export const metadata: Metadata = {
  title: 'Appearance',
};
