import WebsitePage from './WebsitePage';
import { Metadata } from 'next';

export default async function ({ params: { websiteId } }) {
  return <WebsitePage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Website settings - Umami',
};
