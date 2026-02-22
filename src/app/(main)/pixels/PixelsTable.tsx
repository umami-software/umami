import { DataColumn, DataTable, type DataTableProps, Row } from '@umami/react-zen';
import Link from 'next/link';
import { DateDistance } from '@/components/common/DateDistance';
import { ExternalLink } from '@/components/common/ExternalLink';
import { useMessages, useNavigation, useSlug } from '@/components/hooks';
import { PixelDeleteButton } from './PixelDeleteButton';
import { PixelEditButton } from './PixelEditButton';

export interface PixelsTableProps extends DataTableProps {
  showActions?: boolean;
}

export function PixelsTable({ showActions, ...props }: PixelsTableProps) {
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();
  const { getSlugUrl } = useSlug('pixel');

  return (
    <DataTable {...props}>
      <DataColumn id="name" label={t(labels.name)}>
        {({ id, name }: any) => {
          return <Link href={renderUrl(`/pixels/${id}`)}>{name}</Link>;
        }}
      </DataColumn>
      <DataColumn id="url" label="URL">
        {({ slug }: any) => {
          const url = getSlugUrl(slug);
          return (
            <ExternalLink href={url} prefetch={false}>
              {url}
            </ExternalLink>
          );
        }}
      </DataColumn>
      <DataColumn id="created" label={t(labels.created)}>
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
      {showActions && (
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
      )}
    </DataTable>
  );
}
