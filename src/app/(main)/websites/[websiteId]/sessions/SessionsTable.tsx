import { DataColumn, DataTable, type DataTableProps } from '@umami/react-zen';
import Link from 'next/link';
import { Avatar } from '@/components/common/Avatar';
import { DateDistance } from '@/components/common/DateDistance';
import { TypeIcon } from '@/components/common/TypeIcon';
import { useFormat, useMessages, useNavigation } from '@/components/hooks';

export function SessionsTable(props: DataTableProps) {
  const { t, labels } = useMessages();
  const { formatValue } = useFormat();
  const { updateParams } = useNavigation();

  return (
    <DataTable {...props}>
      <DataColumn id="id" label={t(labels.session)} width="100px">
        {(row: any) => (
          <Link href={updateParams({ session: row.id })}>
            <Avatar seed={row.id} size={32} />
          </Link>
        )}
      </DataColumn>
      <DataColumn id="visits" label={t(labels.visits)} width="80px" />
      <DataColumn id="views" label={t(labels.views)} width="80px" />
      <DataColumn id="country" label={t(labels.country)}>
        {(row: any) => (
          <TypeIcon type="country" value={row.country}>
            {formatValue(row.country, 'country')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="city" label={t(labels.city)} />
      <DataColumn id="browser" label={t(labels.browser)}>
        {(row: any) => (
          <TypeIcon type="browser" value={row.browser}>
            {formatValue(row.browser, 'browser')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="os" label={t(labels.os)}>
        {(row: any) => (
          <TypeIcon type="os" value={row.os}>
            {formatValue(row.os, 'os')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="device" label={t(labels.device)}>
        {(row: any) => (
          <TypeIcon type="device" value={row.device}>
            {formatValue(row.device, 'device')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="lastAt" label={t(labels.lastSeen)}>
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
    </DataTable>
  );
}
