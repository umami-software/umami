import Page from 'components/layout/Page';
import Link from 'next/link';
import { Button, Icon, Icons, Text, Flexbox } from 'react-basics';
import { useMessages, useReports } from 'hooks';
import ReportsTable from 'components/pages/reports/ReportsTable';
import WebsiteHeader from './WebsiteHeader';

export function WebsiteReportsPage({ websiteId }) {
  const { formatMessage, labels } = useMessages();
  const { reports, error, isLoading } = useReports(websiteId);

  return (
    <Page loading={isLoading} error={error}>
      <WebsiteHeader websiteId={websiteId} />
      <Flexbox alignItems="center" justifyContent="end">
        <Link href="/reports/create">
          <Button variant="primary">
            <Icon>
              <Icons.Plus />
            </Icon>
            <Text>{formatMessage(labels.createReport)}</Text>
          </Button>
        </Link>
      </Flexbox>
      <ReportsTable websiteId={websiteId} data={reports} />
    </Page>
  );
}

export default WebsiteReportsPage;
