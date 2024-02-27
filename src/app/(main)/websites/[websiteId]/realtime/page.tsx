import WebsiteRealtimePage from './WebsiteRealtimePage';
import { Metadata } from 'next';

export default function ({ params: { websiteId } }) {
  return <WebsiteRealtimePage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Real-time',
};
