import type { Metadata } from 'next';
import { LinksPage } from './LinksPage';

export default function () {
  return <LinksPage />;
}

export const metadata: Metadata = {
  title: 'Links',
};
