import Link from 'next/link';
import { DataTable, DataColumn, Row } from '@umami/react-zen';
import { useConfig, useMessages, useNavigation } from '@/components/hooks';
import { Empty } from '@/components/common/Empty';
import { DateDistance } from '@/components/common/DateDistance';
import { PixelEditButton } from './PixelEditButton';
import { PixelDeleteButton } from './PixelDeleteButton';
import { PIXELS_URL } from '@/lib/constants';

export function PixelsTable({ data = [] }) {
  const { formatMessage, labels } = useMessages();
  const { websiteId } = useNavigation();
  const { pixelsUrl } = useConfig();
  const hostUrl = pixelsUrl || PIXELS_URL;

  if (data.length === 0) {
    return <Empty />;
  }

  return (
    <DataTable data={data}>
      <DataColumn id="name" label={formatMessage(labels.name)} />
      <DataColumn id="url" label="URL">
        {({ slug }: any) => {
          const url = `${hostUrl}/${slug}`;
          return <Link href={url}>{url}</Link>;
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
              <PixelDeleteButton pixelId={id} websiteId={websiteId} name={name} />
            </Row>
          );
        }}
      </DataColumn>
    </DataTable>
  );
}
