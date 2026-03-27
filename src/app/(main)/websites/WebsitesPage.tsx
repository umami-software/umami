'use client';
import { Button, Column, Icon, Row } from '@umami/react-zen';
import { useState } from 'react';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useMessages, useNavigation } from '@/components/hooks';
import { type OverviewRange } from '@/components/hooks/queries/useWebsiteSummaryQuery';
import { LayoutGrid, List } from '@/components/icons';
import { getItem, setItem } from '@/lib/storage';
import { WebsiteAddButton } from './WebsiteAddButton';
import { WebsitesDataTable } from './WebsitesDataTable';
import { WebsitesOverview } from './WebsitesOverview';

const VIEW_KEY = 'umami.websites-view';
const RANGE_KEY = 'umami.websites-range';

const RANGES: { value: OverviewRange; label: string }[] = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '1y', label: '1y' },
];

export function WebsitesPage() {
  const { teamId } = useNavigation();
  const { formatMessage, labels } = useMessages();
  const [view, setView] = useState<'grid' | 'list'>(() => getItem(VIEW_KEY) ?? 'grid');
  const [range, setRange] = useState<OverviewRange>(() => getItem(RANGE_KEY) ?? '24h');

  const handleViewChange = (next: 'grid' | 'list') => {
    setView(next);
    setItem(VIEW_KEY, next);
  };

  const handleRangeChange = (next: OverviewRange) => {
    setRange(next);
    setItem(RANGE_KEY, next);
  };

  return (
    <PageBody>
      <Column gap="6" margin="2">
        <PageHeader title={formatMessage(labels.websites)}>
          <Row gap="2" alignItems="center">
            {/* Range selector — only shown in grid view */}
            {view === 'grid' && (
              <Row gap="1" alignItems="center">
                {RANGES.map(r => (
                  <Button
                    key={r.value}
                    variant={range === r.value ? 'primary' : 'quiet'}
                    size="sm"
                    onPress={() => handleRangeChange(r.value)}
                  >
                    {r.label}
                  </Button>
                ))}
              </Row>
            )}

            {/* View toggle */}
            <Button
              variant={view === 'grid' ? 'primary' : 'quiet'}
              size="sm"
              onPress={() => handleViewChange('grid')}
              aria-label="Grid view"
            >
              <Icon size="sm">
                <LayoutGrid />
              </Icon>
            </Button>
            <Button
              variant={view === 'list' ? 'primary' : 'quiet'}
              size="sm"
              onPress={() => handleViewChange('list')}
              aria-label="List view"
            >
              <Icon size="sm">
                <List />
              </Icon>
            </Button>

            <WebsiteAddButton teamId={teamId} />
          </Row>
        </PageHeader>

        {view === 'grid' ? (
          <WebsitesOverview teamId={teamId} range={range} />
        ) : (
          <Panel>
            <WebsitesDataTable teamId={teamId} />
          </Panel>
        )}
      </Column>
    </PageBody>
  );
}
