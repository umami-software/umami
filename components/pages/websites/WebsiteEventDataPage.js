import Page from 'components/layout/Page';
import WebsiteHeader from './WebsiteHeader';
import WebsiteEventData from './WebsiteEventData';

export default function WebsiteEventDataPage({ websiteId }) {
  return (
    <Page>
      <WebsiteHeader websiteId={websiteId} />
      <WebsiteEventData websiteId={websiteId} />
    </Page>
  );
}
