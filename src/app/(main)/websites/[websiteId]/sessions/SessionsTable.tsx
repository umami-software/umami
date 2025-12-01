import Link from 'next/link';
import { DataColumn, DataTable, DataTableProps } from '@umami/react-zen';
import { useFormat, useMessages, useNavigation } from '@/components/hooks';
import { Avatar } from '@/components/common/Avatar';
import { TypeIcon } from '@/components/common/TypeIcon';
import { DateDistance } from '@/components/common/DateDistance';

export function SessionsTable(props: DataTableProps) {
  const { formatMessage, labels } = useMessages();
  const { formatValue } = useFormat();
  const { updateParams } = useNavigation();

  return (
    <DataTable {...props}>
      <DataColumn id="id" label={formatMessage(labels.session)} width="100px">
        {(row: any) => (
          <Link href={updateParams({ session: row.id })}>
            <Avatar seed={row.id} size={32} />
          </Link>
        )}
      </DataColumn>
      <DataColumn id="visits" label={formatMessage(labels.visits)} width="80px" />
      <DataColumn id="views" label={formatMessage(labels.views)} width="80px" />
      <DataColumn id="country" label={formatMessage(labels.country)}>
        {(row: any) => (
          <TypeIcon type="country" value={row.country}>
            {formatValue(row.country, 'country')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="city" label={formatMessage(labels.city)} />
      <DataColumn id="browser" label={formatMessage(labels.browser)}>
        {(row: any) => (
          <TypeIcon type="browser" value={row.browser}>
            {formatValue(row.browser, 'browser')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="os" label={formatMessage(labels.os)}>
        {(row: any) => (
          <TypeIcon type="os" value={row.os}>
            {formatValue(row.os, 'os')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="device" label={formatMessage(labels.device)}>
        {(row: any) => (
          <TypeIcon type="device" value={row.device}>
            {formatValue(row.device, 'device')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="lastAt" label={formatMessage(labels.lastSeen)}>
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
    </DataTable>
  );
}
