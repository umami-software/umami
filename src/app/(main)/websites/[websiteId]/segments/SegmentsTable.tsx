import { DataTable, DataColumn, Row } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import { Empty } from '@/components/common/Empty';
import { DateDistance } from '@/components/common/DateDistance';
import { filtersObjectToArray } from '@/lib/params';
import { SegmentEditButton } from '@/app/(main)/websites/[websiteId]/segments/SegmentEditButton';
import { SegmentDeleteButton } from '@/app/(main)/websites/[websiteId]/segments/SegmentDeleteButton';

export function SegmentsTable({ data = [] }) {
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
              <SegmentEditButton
                segmentId={id}
                websiteId={websiteId}
                filters={filtersObjectToArray(parameters)}
              />
              <SegmentDeleteButton segmentId={id} websiteId={websiteId} name={name} />
            </Row>
          );
        }}
      </DataColumn>
    </DataTable>
  );
}
