import Link from 'next/link';
import { DataTable, DataColumn, Row, DataTableProps } from '@umami/react-zen';
import { useMessages, useNavigation, useSlug } from '@/components/hooks';
import { DateDistance } from '@/components/common/DateDistance';
import { ExternalLink } from '@/components/common/ExternalLink';
import { LinkEditButton } from './LinkEditButton';
import { LinkDeleteButton } from './LinkDeleteButton';

export function LinksTable(props: DataTableProps) {
  const { formatMessage, labels } = useMessages();
  const { websiteId, renderUrl } = useNavigation();
  const { getSlugUrl } = useSlug('link');

  return (
    <DataTable {...props}>
      <DataColumn id="name" label={formatMessage(labels.name)}>
        {({ id, name }: any) => {
          return <Link href={renderUrl(`/links/${id}`)}>{name}</Link>;
        }}
      </DataColumn>
      <DataColumn id="slug" label={formatMessage(labels.link)}>
        {({ slug }: any) => {
          const url = getSlugUrl(slug);
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
