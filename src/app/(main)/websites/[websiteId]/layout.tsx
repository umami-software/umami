import { Metadata } from 'next';
import WebsiteProvider from './WebsiteProvider';

export default function ({ children, params: { websiteId } }) {
  return <WebsiteProvider websiteId={websiteId}>{children}</WebsiteProvider>;
}

export const metadata: Metadata = {
  title: {
    template: '%s | Umami',
    default: 'Websites | Umami',
  },
};
