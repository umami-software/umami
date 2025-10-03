import Link from 'next/link';
import { DataTable, DataColumn, Row } from '@umami/react-zen';
import { useMessages, useNavigation, useSlug } from '@/components/hooks';
import { Empty } from '@/components/common/Empty';
import { DateDistance } from '@/components/common/DateDistance';
import { PixelEditButton } from './PixelEditButton';
import { PixelDeleteButton } from './PixelDeleteButton';
import { ExternalLink } from '@/components/common/ExternalLink';

export function PixelsTable({ data = [] }) {
  const { formatMessage, labels } = useMessages();
  const { renderUrl } = useNavigation();
  const { getSlugUrl } = useSlug('pixel');

  if (data.length === 0) {
    return <Empty />;
  }

  return (
    <DataTable data={data}>
      <DataColumn id="name" label={formatMessage(labels.name)}>
        {({ id, name }: any) => {
          return <Link href={renderUrl(`/pixels/${id}`)}>{name}</Link>;
        }}
      </DataColumn>
      <DataColumn id="url" label="URL">
        {({ slug }: any) => {
          const url = getSlugUrl(slug);
          return <ExternalLink href={url}>{url}</ExternalLink>;
        }}
      </DataColumn>
      <DataColumn id="created" label={formatMessage(labels.created)}>
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
      <DataColumn id="action" align="end" width="100px">
        {(row: any) => {
          const { id, name } = row;

          return (
            <Row>
              <PixelEditButton pixelId={id} />
              <PixelDeleteButton pixelId={id} name={name} />
            </Row>
          );
        }}
      </DataColumn>
    </DataTable>
  );
}
