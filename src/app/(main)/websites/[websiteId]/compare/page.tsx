import WebsiteComparePage from './WebsiteComparePage';
import { Metadata } from 'next';

export default function ({ params: { websiteId } }) {
  return <WebsiteComparePage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Website Comparison',
};
