import { CopyButton } from '@/components/common/CopyButton';
import Link from '@/components/common/Link';
import { useConfig, useMessages, useMobile } from '@/components/hooks';
import { ExternalLink } from '@/components/icons';
import { DataColumn, DataTable, type DataTableProps, Icon, Row, Text } from '@umami/react-zen';
import { ShareDeleteButton } from './ShareDeleteButton';
import { ShareEditButton } from './ShareEditButton';

export function SharesTable(props: DataTableProps) {
  const { t, labels } = useMessages();
  const { cloudMode } = useConfig();
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
      <DataColumn id="slug" label={t(labels.shareUrl)} width="2fr" style={{ minWidth: 0 }}>
        {({ slug }: any) => {
          const url = getUrl(slug);

          return (
            <Row alignItems="center" gap="1" minWidth="0" width="100%" overflow="hidden">
              <Row alignItems="center" gap minWidth="0" style={{ flex: 1 }}>
                <Text title={url} style={{ minWidth: 0, flex: 1, overflowWrap: 'anywhere' }}>
                  <Link href={url} target="_blank" prefetch={false}>
                    {isMobile ? slug : url}
                  </Link>
                </Text>
                <Icon size="sm" strokeColor="muted" style={{ flexShrink: 0 }}>
                  <ExternalLink />
                </Icon>
              </Row>
              <CopyButton value={url} label="Copy URL" />
            </Row>
          );
        }}
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
