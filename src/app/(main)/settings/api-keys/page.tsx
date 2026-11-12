import type { Metadata } from 'next';
import { ApiKeysPage } from './ApiKeysPage';

export default function () {
  return <ApiKeysPage />;
}

export const metadata: Metadata = {
  title: 'API keys',
};
