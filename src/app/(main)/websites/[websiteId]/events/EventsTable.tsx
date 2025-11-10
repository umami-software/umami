import {
  DataTable,
  DataColumn,
  Row,
  Text,
  DataTableProps,
  IconLabel,
  Button,
  Dialog,
  DialogTrigger,
  Icon,
  Popover,
} from '@umami/react-zen';
import { useFormat, useMessages, useNavigation } from '@/components/hooks';
import { Avatar } from '@/components/common/Avatar';
import Link from 'next/link';
import { Eye, FileText } from '@/components/icons';
import { Lightning } from '@/components/svg';
import { DateDistance } from '@/components/common/DateDistance';
import { TypeIcon } from '@/components/common/TypeIcon';
import { EventData } from '@/components/metrics/EventData';

export function EventsTable(props: DataTableProps) {
  const { formatMessage, labels } = useMessages();
  const { updateParams } = useNavigation();
  const { formatValue } = useFormat();

  return (
    <DataTable {...props}>
      <DataColumn id="event" label={formatMessage(labels.event)} width="2fr">
        {(row: any) => {
          return (
            <Row alignItems="center" wrap="wrap" gap>
              <Row>
                <IconLabel
                  icon={row.eventName ? <Lightning /> : <Eye />}
                  label={formatMessage(row.eventName ? labels.triggeredEvent : labels.viewedPage)}
                />
              </Row>
              <Text
                weight="bold"
                style={{ maxWidth: '300px' }}
                title={row.eventName || row.urlPath}
                truncate
              >
                {row.eventName || row.urlPath}
              </Text>
              {row.hasData > 0 && <PropertiesButton websiteId={row.websiteId} eventId={row.id} />}
            </Row>
          );
        }}
      </DataColumn>
      <DataColumn id="session" label={formatMessage(labels.session)} width="80px">
        {(row: any) => {
          return (
            <Link href={updateParams({ session: row.sessionId })}>
              <Avatar seed={row.sessionId} size={32} />
            </Link>
          );
        }}
      </DataColumn>
      <DataColumn id="location" label={formatMessage(labels.location)}>
        {(row: any) => (
          <TypeIcon type="country" value={row.country}>
            {row.city ? `${row.city}, ` : ''} {formatValue(row.country, 'country')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="browser" label={formatMessage(labels.browser)} width="140px">
        {(row: any) => (
          <TypeIcon type="browser" value={row.browser}>
            {formatValue(row.browser, 'browser')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="device" label={formatMessage(labels.device)} width="120px">
        {(row: any) => (
          <TypeIcon type="device" value={row.device}>
            {formatValue(row.device, 'device')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="created" width="160px" align="end">
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
    </DataTable>
  );
}

const PropertiesButton = props => {
  return (
    <DialogTrigger>
      <Button variant="quiet">
        <Row alignItems="center" gap>
          <Icon>
            <FileText />
          </Icon>
        </Row>
      </Button>
      <Popover placement="right">
        <Dialog>
          <EventData {...props} />
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
};
