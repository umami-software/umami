import { DataColumn, DataTable, type DataTableProps, Row } from '@umami/react-zen';
import { DateDistance } from '@/components/common/DateDistance';
import { ExternalLink } from '@/components/common/ExternalLink';
import Link from '@/components/common/Link';
import { SortableLabel } from '@/components/common/SortableLabel';
import { useMessages, useNavigation, useSlug } from '@/components/hooks';
import { LinkDeleteButton } from './LinkDeleteButton';
import { LinkEditButton } from './LinkEditButton';

export interface LinksTableProps extends DataTableProps {
  showActions?: boolean;
}

export function LinksTable({ showActions, ...props }: LinksTableProps) {
  const { t, labels } = useMessages();
  const { websiteId, renderUrl } = useNavigation();
  const { getSlugUrl } = useSlug('link');

  return (
    <DataTable {...props}>
      <DataColumn id="name" label={<SortableLabel label={t(labels.name)} sortKey="name" />}>
        {({ id, name }: any) => {
          return <Link href={renderUrl(`/links/${id}`)}>{name}</Link>;
        }}
      </DataColumn>
      <DataColumn
        id="slug"
        label={<SortableLabel label={t(labels.link)} sortKey="slug" />}
        width="25%"
      >
        {({ slug }: any) => {
          const url = getSlugUrl(slug);
          return <ExternalLink href={url}>{url}</ExternalLink>;
        }}
      </DataColumn>
      <DataColumn
        id="url"
        label={<SortableLabel label={t(labels.destinationUrl)} sortKey="url" />}
        width="30%"
      >
        {({ url }: any) => {
          return <ExternalLink href={url}>{url}</ExternalLink>;
        }}
      </DataColumn>
      <DataColumn
        id="created"
        label={
          <SortableLabel label={t(labels.created)} sortKey="createdAt" defaultDirection="desc" />
        }
        width="200px"
      >
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
      {showActions && (
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
      )}
    </DataTable>
  );
}
