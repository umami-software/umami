import { DataTable, DataColumn, Row } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import { Empty } from '@/components/common/Empty';
import { DateDistance } from '@/components/common/DateDistance';
import { filtersObjectToArray } from '@/lib/params';
import { CohortEditButton } from '@/app/(main)/websites/[websiteId]/cohorts/CohortEditButton';
import { CohortDeleteButton } from '@/app/(main)/websites/[websiteId]/cohorts/CohortDeleteButton';

export function CohortsTable({ data = [] }) {
  const { formatMessage, labels } = useMessages();
  const { websiteId } = useNavigation();

  if (data.length === 0) {
    return <Empty />;
  }

  return (
    <DataTable data={data}>
      <DataColumn id="name" label={formatMessage(labels.name)} />
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
