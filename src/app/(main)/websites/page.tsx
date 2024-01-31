import WebsitesHeader from 'app/(main)/settings/websites/WebsitesHeader';
import WebsitesBrowse from './WebsitesBrowse';
import { Metadata } from 'next';

export default function WebsitesPage() {
  return (
    <>
      <WebsitesHeader showActions={false} />
      <WebsitesBrowse />
    </>
  );
}

export const metadata: Metadata = {
  title: 'Websites | umami',
};
