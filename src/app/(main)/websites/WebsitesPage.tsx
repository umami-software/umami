'use client';
import { Button, Column, Icon, Row } from '@umami/react-zen';
import { useState } from 'react';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useMessages, useNavigation } from '@/components/hooks';
import { type OverviewRange } from '@/components/hooks/queries/useWebsiteSummaryQuery';
import { type SortField } from '@/components/hooks/queries/useAllWebsiteStatsQuery';
import { LayoutGrid, List } from '@/components/icons';
import { getItem, setItem } from '@/lib/storage';
import { WebsiteAddButton } from './WebsiteAddButton';
import { WebsitesDataTable } from './WebsitesDataTable';
import { WebsitesOverview } from './WebsitesOverview';

const VIEW_KEY = 'umami.websites-view';
const RANGE_KEY = 'umami.websites-range';
const SORT_KEY = 'umami.websites-sort';

const RANGES: { value: OverviewRange; label: string }[] = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '1y', label: '1y' },
];

export function WebsitesPage() {
  const { teamId } = useNavigation();
  const { formatMessage, labels } = useMessages();

  const sorts: { value: SortField; label: string }[] = [
    { value: 'name', label: formatMessage(labels.name) },
    { value: 'visitors', label: formatMessage(labels.visitors) },
    { value: 'pageviews', label: formatMessage(labels.views) },
  ];
  const [view, setView] = useState<'grid' | 'list'>(() => getItem(VIEW_KEY) ?? 'grid');
  const [range, setRange] = useState<OverviewRange>(() => getItem(RANGE_KEY) ?? '24h');
  const [sort, setSort] = useState<SortField>(() => getItem(SORT_KEY) ?? 'name');

  const handleViewChange = (next: 'grid' | 'list') => {
    setView(next);
    setItem(VIEW_KEY, next);
  };

  const handleRangeChange = (next: OverviewRange) => {
    setRange(next);
    setItem(RANGE_KEY, next);
  };

  const handleSortChange = (next: SortField) => {
    setSort(next);
    setItem(SORT_KEY, next);
  };

  return (
    <PageBody>
      <Column gap="6" margin="2">
        <PageHeader title={formatMessage(labels.websites)}>
          <Row gap="2" alignItems="center">
            {view === 'grid' && (
              <>
                {/* Sort selector */}
                <Row gap="1" alignItems="center">
                  <span style={{ fontSize: '12px', color: 'var(--text-500)', whiteSpace: 'nowrap' }}>
                    {formatMessage(labels.sort)}:
                  </span>
                  {sorts.map(s => (
                    <Button
                      key={s.value}
                      variant={sort === s.value ? 'primary' : 'quiet'}
                      size="sm"
                      onPress={() => handleSortChange(s.value)}
                    >
                      {s.label}
                    </Button>
                  ))}
                </Row>

                {/* Range selector */}
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
              </>
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
          <WebsitesOverview teamId={teamId} range={range} sort={sort} />
        ) : (
          <Panel>
            <WebsitesDataTable teamId={teamId} />
          </Panel>
        )}
      </Column>
    </PageBody>
  );
}
