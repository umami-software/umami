import { DataColumn, DataTable, type DataTableProps } from '@umami/react-zen';
import Link from '@/components/common/Link';
import { Avatar } from '@/components/common/Avatar';
import { DateDistance } from '@/components/common/DateDistance';
import { TypeIcon } from '@/components/common/TypeIcon';
import { useFormat, useMessages } from '@/components/hooks';

export function SessionsTable({
  websiteId,
  getSessionHref,
  ...props
}: DataTableProps & { websiteId: string; getSessionHref?: (row: any) => string }) {
  const { t, labels } = useMessages();
  const { formatValue } = useFormat();

  return (
    <DataTable {...props}>
      <DataColumn id="id" label={t(labels.session)} width="100px">
        {(row: any) => (
          <Link href={getSessionHref ? getSessionHref(row) : `/websites/${websiteId}/sessions/${row.id}`}>
            <Avatar seed={row.id} size={32} />
          </Link>
        )}
      </DataColumn>
      <DataColumn id="visits" label={t(labels.visits)} width="80px" />
      <DataColumn id="views" label={t(labels.views)} width="80px" />
      <DataColumn id="events" label={t(labels.events)} width="80px" />
      <DataColumn id="location" label={t(labels.location)}>
        {(row: any) => (
          <TypeIcon type="country" value={row.country}>
            {row.city ? `${row.city}, ` : ''}
            {formatValue(row.country, 'country')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="browser" label={t(labels.browser)} width="140px">
        {(row: any) => (
          <TypeIcon type="browser" value={row.browser}>
            {formatValue(row.browser, 'browser')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="os" label={t(labels.os)} width="140px">
        {(row: any) => (
          <TypeIcon type="os" value={row.os}>
            {formatValue(row.os, 'os')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="device" label={t(labels.device)} width="140px">
        {(row: any) => (
          <TypeIcon type="device" value={row.device}>
            {formatValue(row.device, 'device')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="lastAt" label={t(labels.lastSeen)} width="140px">
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
    </DataTable>
  );
}
