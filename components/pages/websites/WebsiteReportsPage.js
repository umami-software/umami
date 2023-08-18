import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import Page from 'components/layout/Page';
import ReportsTable from 'components/pages/reports/ReportsTable';
import { useMessages, useWebsiteReports } from 'hooks';
import Link from 'next/link';
import { Button, Flexbox, Icon, Icons, Text } from 'react-basics';
import WebsiteHeader from './WebsiteHeader';

export function WebsiteReportsPage({ websiteId }) {
  const { formatMessage, labels, messages } = useMessages();
  const {
    reports,
    error,
    isLoading,
    deleteReport,
    filter,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
  } = useWebsiteReports(websiteId);

  const hasData = (reports && reports.data.length !== 0) || filter;

  const handleDelete = async id => {
    await deleteReport(id);
  };

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
      {hasData && (
        <ReportsTable
          data={reports}
          onDelete={handleDelete}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          filterValue={filter}
        />
      )}
      {!hasData && <EmptyPlaceholder message={formatMessage(messages.noDataAvailable)} />}
    </Page>
  );
}

export default WebsiteReportsPage;
