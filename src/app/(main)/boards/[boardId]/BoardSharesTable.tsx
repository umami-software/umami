import { ShareDeleteButton } from '@/app/(main)/websites/[websiteId]/settings/ShareDeleteButton';
import { CopyButton } from '@/components/common/CopyButton';
import { ExternalLink } from '@/components/common/ExternalLink';
import { useConfig, useMessages, useMobile } from '@/components/hooks';
import { DataColumn, DataTable, type DataTableProps, Row } from '@umami/react-zen';

interface BoardSharesTableProps extends DataTableProps {
  dateRangeValue?: string | object;
}

export function BoardSharesTable({ dateRangeValue, ...props }: BoardSharesTableProps) {
  const { t, labels } = useMessages();
  const { cloudMode } = useConfig();
  const { isMobile } = useMobile();

  const getUrl = (slug: string) => {
    let baseUrl = cloudMode
      ? `${process.env.cloudUrl}/share/${slug}`
      : `${window?.location.origin}${process.env.basePath || ''}/share/${slug}`;

    if (dateRangeValue) {
      const rangeString = typeof dateRangeValue === 'object' 
        ? JSON.stringify(dateRangeValue) 
        : dateRangeValue;
        
      return `${baseUrl}?range=${encodeURIComponent(rangeString)}`;
    }

    return baseUrl;
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
      <DataColumn id="action" align="end" width="60px">
        {({ id, slug }: any) => (
          <Row>
            <ShareDeleteButton shareId={id} slug={slug} />
          </Row>
        )}
      </DataColumn>
    </DataTable>
  );
}