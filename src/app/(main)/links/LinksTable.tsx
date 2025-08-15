import { DataTable, DataColumn, Row } from '@umami/react-zen';
import { useConfig, useMessages, useNavigation } from '@/components/hooks';
import { Empty } from '@/components/common/Empty';
import { DateDistance } from '@/components/common/DateDistance';
import { ExternalLink } from '@/components/common/ExternalLink';
import { LinkEditButton } from './LinkEditButton';
import { LinkDeleteButton } from './LinkDeleteButton';

export function LinksTable({ data = [] }) {
  const { formatMessage, labels } = useMessages();
  const { websiteId } = useNavigation();
  const { linksUrl } = useConfig();
  const hostUrl = linksUrl || `${window.location.origin}/x`;

  if (data.length === 0) {
    return <Empty />;
  }

  return (
    <DataTable data={data}>
      <DataColumn id="name" label={formatMessage(labels.name)} />
      <DataColumn id="slug" label={formatMessage(labels.link)}>
        {({ slug }: any) => {
          const url = `${hostUrl}/${slug}`;
          return <ExternalLink href={url}>{url}</ExternalLink>;
        }}
      </DataColumn>
      <DataColumn id="url" label={formatMessage(labels.destinationUrl)}>
        {({ url }: any) => {
          return <ExternalLink href={url}>{url}</ExternalLink>;
        }}
      </DataColumn>
      <DataColumn id="created" label={formatMessage(labels.created)} width="200px">
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
      <DataColumn id="action" align="end" width="100px">
        {({ id, name }: any) => {
          return (
            <Row>
              <LinkEditButton linkId={id} />
              <LinkDeleteButton linkId={id} websiteId={websiteId} name={name} />
            </Row>
          );
        }}
      </DataColumn>
    </DataTable>
  );
}
