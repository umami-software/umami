import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import Link from 'next/link';
import { Button, Icon, Icons, Text } from 'react-basics';
import { useMessages, useReports } from 'hooks';
import ReportsTable from './ReportsTable';

export function ReportsPage() {
  const { formatMessage, labels } = useMessages();
  const { reports, error, isLoading } = useReports();

  return (
    <Page loading={isLoading} error={error}>
      <PageHeader title={formatMessage(labels.reports)}>
        <Link href="/reports/create">
          <Button variant="primary">
            <Icon>
              <Icons.Plus />
            </Icon>
            <Text>{formatMessage(labels.createReport)}</Text>
          </Button>
        </Link>
      </PageHeader>
      <ReportsTable data={reports} />
    </Page>
  );
}

export default ReportsPage;
