import { DataColumn, DataTable, type DataTableProps, Row } from '@umami/react-zen';
import { ShareDeleteButton } from '@/app/(main)/websites/[websiteId]/settings/ShareDeleteButton';
import { CopyButton } from '@/components/common/CopyButton';
import { DateDistance } from '@/components/common/DateDistance';
import { ExternalLink } from '@/components/common/ExternalLink';
import { useConfig, useMessages, useMobile } from '@/components/hooks';
import { SimpleShareEditButton } from './SimpleShareEditButton';

export function SimpleSharesTable(props: DataTableProps) {
  const { t, labels } = useMessages();
  const config = useConfig();
  const cloudMode = config?.cloudMode;
  const { isMobile } = useMobile();

  const getUrl = (slug: string) => {
    if (cloudMode) {
      return `${process.env.cloudUrl}/share/${slug}`;
    }

    return `${window?.location.origin}${process.env.basePath || ''}/share/${slug}`;
  };

  return (
    <DataTable {...props} displayMode={isMobile ? 'cards' : 'table'}>
      <DataColumn id="name" label={t(labels.name)}>
        {({ name }: any) => name}
      </DataColumn>
      <DataColumn id="slug" label={t(labels.shareUrl)} width="2fr">
        {({ slug }: any) => {
          const url = getUrl(slug);

          return (
            <Row alignItems="center" gap="1" overflow="hidden">
              <ExternalLink href={url} prefetch={false}>
                {isMobile ? slug : url}
              </ExternalLink>
              <CopyButton value={url} label="Copy URL" />
            </Row>
          );
        }}
      </DataColumn>
      <DataColumn id="created" label={t(labels.created)}>
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
      <DataColumn id="action" align="end" width="100px">
        {({ id, slug }: any) => (
          <Row>
            <SimpleShareEditButton shareId={id} />
            <ShareDeleteButton shareId={id} slug={slug} />
          </Row>
        )}
      </DataColumn>
    </DataTable>
  );
}
