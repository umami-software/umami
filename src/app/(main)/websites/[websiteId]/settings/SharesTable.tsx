import { DataColumn, DataTable, type DataTableProps, Row } from '@umami/react-zen';
import { DateDistance } from '@/components/common/DateDistance';
import { ExternalLink } from '@/components/common/ExternalLink';
import { useConfig, useMessages } from '@/components/hooks';
import { ShareDeleteButton } from './ShareDeleteButton';
import { ShareEditButton } from './ShareEditButton';

export function SharesTable(props: DataTableProps) {
  const { formatMessage, labels } = useMessages();
  const { cloudMode } = useConfig();

  const getUrl = (slug: string) => {
    if (cloudMode) {
      return `${process.env.cloudUrl}/share/${slug}`;
    }
    return `${window?.location.origin}${process.env.basePath || ''}/share/${slug}`;
  };

  return (
    <DataTable {...props}>
      <DataColumn id="name" label={formatMessage(labels.name)}>
        {({ name }: any) => name}
      </DataColumn>
      <DataColumn id="slug" label={formatMessage(labels.shareUrl)}>
        {({ slug }: any) => {
          const url = getUrl(slug);
          return (
            <ExternalLink href={url} prefetch={false}>
              {url}
            </ExternalLink>
          );
        }}
      </DataColumn>
      <DataColumn id="created" label={formatMessage(labels.created)} width="200px">
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
      <DataColumn id="action" align="end" width="100px">
        {({ id, slug }: any) => {
          return (
            <Row>
              <ShareEditButton shareId={id} />
              <ShareDeleteButton shareId={id} slug={slug} />
            </Row>
          );
        }}
      </DataColumn>
    </DataTable>
  );
}
