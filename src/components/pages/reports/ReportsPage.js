import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import { useMessages, useReports } from 'components/hooks';
import Link from 'next/link';
import { Button, Icon, Icons, Text } from 'react-basics';
import ReportsTable from './ReportsTable';

export function ReportsPage() {
  const { formatMessage, labels } = useMessages();
  const {
    reports,
    error,
    isLoading,
    deleteReport,
    filter,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
  } = useReports();

  const hasData = (reports && reports?.data.length !== 0) || filter;

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

      {hasData && (
        <ReportsTable
          data={reports}
          showSearch={true}
          showPaging={true}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onDelete={deleteReport}
          filterValue={filter}
          showDomain={true}
        />
      )}
      {!hasData && <EmptyPlaceholder />}
    </Page>
  );
}

export default ReportsPage;
