import { Icon, Row, Text } from '@umami/react-zen';
import type { ReactNode } from 'react';
import { CopyButton } from '@/components/common/CopyButton';
import { useConfig, useMessages, useMobile } from '@/components/hooks';
import { ExternalLink } from '@/components/icons';

const desktopGridTemplateColumns = 'minmax(180px, 1fr) minmax(0, 2fr) auto';
const rowBorder = '1px solid var(--border-default)';

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

  return (
    <div style={{ width: '100%' }}>
      {!isMobile && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: desktopGridTemplateColumns,
            gap: '16px',
            alignItems: 'center',
            padding: '0 0 12px',
            borderBottom: rowBorder,
          }}
        >
          <Text weight="bold">{t(labels.name)}</Text>
          <Text weight="bold">{t(labels.shareUrl)}</Text>
          <div />
        </div>
      )}
      <div>
        {data.map(row => {
          const url = getUrl(row.slug);

          if (isMobile) {
            return (
              <div
                key={row.id}
                style={{
                  padding: '12px 0',
                  borderBottom: rowBorder,
                }}
              >
                <Text weight="bold">{row.name}</Text>
                <div style={{ marginTop: '8px' }}>
                  <ShareUrlCell url={url} value={row.slug} />
                </div>
                <Row justifyContent="flex-end" style={{ marginTop: '12px' }}>
                  {renderActions(row)}
                </Row>
              </div>
            );
          }

          return (
            <div
              key={row.id}
              style={{
                display: 'grid',
                gridTemplateColumns: desktopGridTemplateColumns,
                gap: '16px',
                alignItems: 'center',
                minHeight: '56px',
                padding: '12px 0',
                borderBottom: rowBorder,
              }}
            >
              <Text>{row.name}</Text>
              <ShareUrlCell url={url} value={url} />
              <Row justifyContent="flex-end">{renderActions(row)}</Row>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ShareUrlCell({ url, value }: { url: string; value: string }) {
  return (
    <Row alignItems="center" gap="1" minWidth="0" width="100%" overflow="hidden">
      <Row alignItems="center" gap minWidth="0" style={{ flex: 1 }}>
        <Text title={url} style={{ minWidth: 0, flex: 1, overflowWrap: 'anywhere' }}>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-edge underline-offset-4 hover:text-foreground-primary hover:decoration-primary"
          >
            {value}
          </a>
        </Text>
        <Icon size="sm" strokeColor="muted" style={{ flexShrink: 0 }}>
          <ExternalLink />
        </Icon>
      </Row>
      <CopyButton value={url} label="Copy URL" />
    </Row>
  );
}
