import { Button, Icon, Row, Text } from '@umami/react-zen';
import type { CSSProperties, ReactNode } from 'react';
import { CopyButton } from '@/components/common/CopyButton';
import { useConfig, useMessages, useMobile } from '@/components/hooks';
import { ExternalLink } from '@/components/icons';

const desktopGridTemplateColumns = 'minmax(180px, 1fr) minmax(0, 2fr) auto';
const rowBorder = '1px solid var(--border)';
const subgridRow: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'subgrid',
  gridColumn: '1 / -1',
  alignItems: 'center',
  borderBottom: rowBorder,
};

export interface ShareRow {
  id: string;
  name: string;
  slug: string;
}

export function SharedSharesTable({
  data = [],
  renderActions,
}: {
  data?: ShareRow[];
  renderActions: (row: ShareRow) => ReactNode;
}) {
  const { t, labels } = useMessages();
  const { cloudMode } = useConfig();
  const { isMobile } = useMobile();

  const getUrl = (slug: string) => {
    if (cloudMode) {
      return `${process.env.cloudUrl}/share/${slug}`;
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    return `${origin}${process.env.basePath || ''}/share/${slug}`;
  };

  if (isMobile) {
    return (
      <div style={{ width: '100%' }}>
        {data.map(row => {
          const url = getUrl(row.slug);

          return (
            <div
              key={row.id}
              style={{
                padding: '12px 0',
                borderBottom: rowBorder,
              }}
            >
              <Row alignItems="center" justifyContent="space-between" gap>
                <Text weight="bold" truncate style={{ minWidth: 0 }}>
                  {row.name}
                </Text>
                <Row style={{ flexShrink: 0 }}>{renderActions(row)}</Row>
              </Row>
              <ShareUrlCell url={url} value={url} />
            </div>
          );
        })}
      </div>
    );
  }

  // One outer grid with a subgrid per row, so the header and every row share
  // the same column tracks regardless of how wide each row's actions are.
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: desktopGridTemplateColumns,
        columnGap: '16px',
        width: '100%',
      }}
    >
      <div style={{ ...subgridRow, padding: '0 0 12px' }}>
        <Text weight="bold">{t(labels.name)}</Text>
        <Text weight="bold">{t(labels.shareUrl)}</Text>
        <div />
      </div>
      {data.map(row => {
        const url = getUrl(row.slug);

        return (
          <div key={row.id} style={{ ...subgridRow, minHeight: '56px', padding: '12px 0' }}>
            <Text>{row.name}</Text>
            <ShareUrlCell url={url} value={url} />
            <Row justifyContent="flex-end">{renderActions(row)}</Row>
          </div>
        );
      })}
    </div>
  );
}

function ShareUrlCell({ url, value }: { url: string; value: string }) {
  return (
    <Row alignItems="center" minWidth="0" width="100%">
      <Text title={url} truncate style={{ minWidth: 0, flex: 1 }}>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-edge underline-offset-4 hover:text-foreground-primary hover:decoration-primary"
        >
          {value}
        </a>
      </Text>
      <Row style={{ flexShrink: 0 }}>
        <Button
          variant="ghost"
          nativeButton={false}
          render={<a href={url} target="_blank" rel="noreferrer" />}
          aria-label="Open URL"
        >
          <Icon size="sm">
            <ExternalLink />
          </Icon>
        </Button>
        <CopyButton value={url} label="Copy URL" />
      </Row>
    </Row>
  );
}
