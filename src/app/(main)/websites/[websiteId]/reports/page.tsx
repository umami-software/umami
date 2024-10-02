import WebsiteReportsPage from './WebsiteReportsPage';
import { Metadata } from 'next';

export default function ({ params: { websiteId } }) {
  return <WebsiteReportsPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Website Reports',
};
