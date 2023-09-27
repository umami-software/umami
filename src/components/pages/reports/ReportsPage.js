import PageHeader from 'components/layout/PageHeader';
import { useMessages, useApi } from 'components/hooks';
import Link from 'next/link';
import { Button, Icon, Icons, Text } from 'react-basics';
import ReportsTable from './ReportsTable';
import useFilterQuery from 'components/hooks/useFilterQuery';
import DataTable from 'components/common/DataTable';

function useReports() {
  const { get, del, useMutation } = useApi();
  const { mutate } = useMutation(reportId => del(`/reports/${reportId}`));
  const reports = useFilterQuery(['reports'], params => get(`/reports`, params));

  const deleteReport = id => {
    mutate(id, {
      onSuccess: () => {
        reports.refetch();
      },
    });
  };

  return { reports, deleteReport };
}

export function ReportsPage() {
  const { formatMessage, labels } = useMessages();
  const { reports, deleteReport } = useReports();

  const handleDelete = async (id, callback) => {
    await deleteReport(id);
    await reports.refetch();
    callback?.();
  };

  return (
    <>
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
      <DataTable {...reports}>
        {({ data }) => <ReportsTable data={data} showDomain={true} onDelete={handleDelete} />}
      </DataTable>
    </>
  );
}

export default ReportsPage;
