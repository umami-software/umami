import { DataTable, DataColumn, Row, DataTableProps } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import { DateDistance } from '@/components/common/DateDistance';
import { filtersObjectToArray } from '@/lib/params';
import { CohortEditButton } from '@/app/(main)/websites/[websiteId]/cohorts/CohortEditButton';
import { CohortDeleteButton } from '@/app/(main)/websites/[websiteId]/cohorts/CohortDeleteButton';
import Link from 'next/link';

export function CohortsTable(props: DataTableProps) {
  const { formatMessage, labels } = useMessages();
  const { websiteId, renderUrl } = useNavigation();

  return (
    <DataTable {...props}>
      <DataColumn id="name" label={formatMessage(labels.name)}>
        {(row: any) => (
          <Link href={renderUrl(`/websites/${websiteId}?cohort=${row.id}`, false)}>{row.name}</Link>
        )}
      </DataColumn>
      <DataColumn id="created" label={formatMessage(labels.created)}>
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
      <DataColumn id="action" align="end" width="100px">
        {(row: any) => {
          const { id, name, parameters } = row;

          return (
            <Row>
              <CohortEditButton
                cohortId={id}
                websiteId={websiteId}
                filters={filtersObjectToArray(parameters)}
              />
              <CohortDeleteButton cohortId={id} websiteId={websiteId} name={name} />
            </Row>
          );
        }}
      </DataColumn>
    </DataTable>
  );
}
