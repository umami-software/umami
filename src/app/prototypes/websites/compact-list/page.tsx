'use client';

import { useQuery } from '@tanstack/react-query';
import { Button, Column, Icon, Row, SearchField, Text } from '@umami/react-zen';
import { ArrowDownRight, ArrowUpRight, ExternalLink, Settings, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Favicon } from '@/components/common/Favicon';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useApi } from '@/components/hooks';

// Realistic sample data for the prototype
const SAMPLE_WEBSITES = [
  {
    id: '1',
    name: 'Hulu',
    domain: 'hulu.com',
    pageviews: 2847293,
    visitors: 892341,
    change: 12.4,
    status: 'active',
    lastActivity: '2 min ago',
  },
  {
    id: '2',
    name: 'Disney+',
    domain: 'disneyplus.com',
    pageviews: 1923847,
    visitors: 634892,
    change: 8.2,
    status: 'active',
    lastActivity: '5 min ago',
  },
  {
    id: '3',
    name: 'ESPN',
    domain: 'espn.com',
    pageviews: 3421987,
    visitors: 1234567,
    change: -3.1,
    status: 'active',
    lastActivity: '1 min ago',
  },
  {
    id: '4',
    name: 'FX Networks',
    domain: 'fxnetworks.com',
    pageviews: 892341,
    visitors: 312456,
    change: 5.7,
    status: 'active',
    lastActivity: '12 min ago',
  },
  {
    id: '5',
    name: 'ABC',
    domain: 'abc.com',
    pageviews: 1567234,
    visitors: 523891,
    change: -1.2,
    status: 'active',
    lastActivity: '8 min ago',
  },
  {
    id: '6',
    name: 'National Geographic',
    domain: 'nationalgeographic.com',
    pageviews: 743219,
    visitors: 287654,
    change: 15.3,
    status: 'active',
    lastActivity: '3 min ago',
  },
  {
    id: '7',
    name: 'Freeform',
    domain: 'freeform.com',
    pageviews: 456123,
    visitors: 178234,
    change: 2.1,
    status: 'active',
    lastActivity: '15 min ago',
  },
  {
    id: '8',
    name: 'FX Now',
    domain: 'fxnow.fxnetworks.com',
    pageviews: 234567,
    visitors: 89234,
    change: -5.4,
    status: 'active',
    lastActivity: '22 min ago',
  },
];

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Mini sparkline component
function MiniSparkline({ positive }: { positive: boolean }) {
  const points = positive
    ? '0,20 5,18 10,15 15,17 20,12 25,14 30,8 35,10 40,5'
    : '0,5 5,8 10,6 15,10 20,12 25,9 30,15 35,13 40,20';

  return (
    <svg width="40" height="24" viewBox="0 0 40 24" style={{ opacity: 0.7 }}>
      <polyline
        points={points}
        fill="none"
        stroke={positive ? 'var(--green-500, #22c55e)' : 'var(--red-500, #ef4444)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface WebsiteRowProps {
  website: (typeof SAMPLE_WEBSITES)[0];
  isSelected: boolean;
  onSelect: () => void;
}

function WebsiteRow({ website, isSelected, onSelect }: WebsiteRowProps) {
  const isPositive = website.change >= 0;

  return (
    <Row
      alignItems="center"
      padding="3"
      gap="4"
      onClick={onSelect}
      style={{
        cursor: 'pointer',
        backgroundColor: isSelected ? 'var(--base-200)' : 'transparent',
        borderRadius: 6,
        transition: 'background-color 0.15s ease',
      }}
    >
      {/* Favicon and name */}
      <Row alignItems="center" gap="3" style={{ flex: '0 0 200px' }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            backgroundColor: 'var(--base-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Favicon domain={website.domain} style={{ width: 16, height: 16 }} />
        </div>
        <Column gap="0">
          <Text size="2" weight="semibold" wrap="nowrap">
            {website.name}
          </Text>
          <Text size="1" style={{ opacity: 0.5 }} wrap="nowrap">
            {website.domain}
          </Text>
        </Column>
      </Row>

      {/* Mini sparkline */}
      <div style={{ flex: '0 0 50px' }}>
        <MiniSparkline positive={isPositive} />
      </div>

      {/* Page views */}
      <Column style={{ flex: '0 0 100px' }} alignItems="flex-end">
        <Text size="2" weight="medium">
          {formatNumber(website.pageviews)}
        </Text>
        <Text size="1" style={{ opacity: 0.5 }}>
          views
        </Text>
      </Column>

      {/* Visitors */}
      <Column style={{ flex: '0 0 100px' }} alignItems="flex-end">
        <Text size="2" weight="medium">
          {formatNumber(website.visitors)}
        </Text>
        <Text size="1" style={{ opacity: 0.5 }}>
          visitors
        </Text>
      </Column>

      {/* Change indicator */}
      <Row
        alignItems="center"
        gap="1"
        style={{
          flex: '0 0 80px',
          color: isPositive ? 'var(--green-500, #22c55e)' : 'var(--red-500, #ef4444)',
        }}
      >
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        <Text size="2" weight="medium">
          {Math.abs(website.change)}%
        </Text>
      </Row>

      {/* Last activity */}
      <Text size="1" style={{ flex: '0 0 80px', opacity: 0.5 }} wrap="nowrap">
        {website.lastActivity}
      </Text>

      {/* Actions */}
      <Row gap="1" style={{ flex: '0 0 auto' }}>
        <Link href={`/websites/${website.id}`} onClick={e => e.stopPropagation()}>
          <Button variant="quiet" size="sm">
            <Icon>
              <ExternalLink size={14} />
            </Icon>
          </Button>
        </Link>
        <Link href={`/websites/${website.id}/settings`} onClick={e => e.stopPropagation()}>
          <Button variant="quiet" size="sm">
            <Icon>
              <Settings size={14} />
            </Icon>
          </Button>
        </Link>
      </Row>
    </Row>
  );
}

export default function WebsitesCompactListPage() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { get } = useApi();

  // Try to fetch real data, fall back to sample data
  const { data, isLoading } = useQuery({
    queryKey: ['websites-prototype-compact'],
    queryFn: async () => {
      try {
        const result = await get('/me/websites');
        return result?.data || [];
      } catch {
        return null;
      }
    },
  });

  const websites = data && data.length > 0 ? data : SAMPLE_WEBSITES;

  const filteredWebsites = websites.filter(
    (site: any) =>
      site.name.toLowerCase().includes(search.toLowerCase()) ||
      site.domain.toLowerCase().includes(search.toLowerCase()),
  );

  // Add mock metrics to real data if needed
  const websitesWithMetrics = filteredWebsites.map((site: any, index: number) => ({
    ...site,
    pageviews: site.pageviews || SAMPLE_WEBSITES[index % SAMPLE_WEBSITES.length].pageviews,
    visitors: site.visitors || SAMPLE_WEBSITES[index % SAMPLE_WEBSITES.length].visitors,
    change: site.change ?? SAMPLE_WEBSITES[index % SAMPLE_WEBSITES.length].change,
    lastActivity: site.lastActivity || SAMPLE_WEBSITES[index % SAMPLE_WEBSITES.length].lastActivity,
  }));

  // Calculate totals
  const totalPageviews = websitesWithMetrics.reduce(
    (sum: number, site: any) => sum + site.pageviews,
    0,
  );
  const totalVisitors = websitesWithMetrics.reduce(
    (sum: number, site: any) => sum + site.visitors,
    0,
  );

  return (
    <PageBody>
      <Column gap="5" margin="2">
        <PageHeader title="Websites" />

        {/* Summary stats bar */}
        <Row
          alignItems="center"
          justifyContent="space-between"
          padding="4"
          backgroundColor
          border
          borderRadius="3"
        >
          <Row gap="6">
            <Row alignItems="center" gap="2">
              <TrendingUp size={16} style={{ opacity: 0.5 }} />
              <Text size="2" weight="medium">
                {websitesWithMetrics.length} websites
              </Text>
            </Row>
            <Row alignItems="center" gap="2">
              <Text size="2" style={{ opacity: 0.5 }}>
                Total views:
              </Text>
              <Text size="2" weight="bold">
                {formatNumber(totalPageviews)}
              </Text>
            </Row>
            <Row alignItems="center" gap="2">
              <Text size="2" style={{ opacity: 0.5 }}>
                Total visitors:
              </Text>
              <Text size="2" weight="bold">
                {formatNumber(totalVisitors)}
              </Text>
            </Row>
          </Row>
          <Button variant="primary" size="sm">
            Add Website
          </Button>
        </Row>

        {/* Search and filters */}
        <Row alignItems="center" gap="4">
          <SearchField
            value={search}
            onSearch={setSearch}
            placeholder="Filter websites..."
            style={{ maxWidth: 280 }}
          />
          <Row gap="2">
            <Button variant="quiet" size="sm">
              All
            </Button>
            <Button variant="quiet" size="sm">
              Active
            </Button>
            <Button variant="quiet" size="sm">
              Trending Up
            </Button>
          </Row>
        </Row>

        {/* Compact list */}
        <Panel padding="2">
          <LoadingPanel isLoading={isLoading} data={websitesWithMetrics}>
            {/* Header row */}
            <Row
              alignItems="center"
              padding="3"
              gap="4"
              style={{
                borderBottom: '1px solid var(--base-300)',
                marginBottom: 4,
              }}
            >
              <Text size="1" weight="medium" style={{ flex: '0 0 200px', opacity: 0.5 }}>
                WEBSITE
              </Text>
              <div style={{ flex: '0 0 50px' }} />
              <Text
                size="1"
                weight="medium"
                style={{ flex: '0 0 100px', opacity: 0.5, textAlign: 'right' }}
              >
                VIEWS
              </Text>
              <Text
                size="1"
                weight="medium"
                style={{ flex: '0 0 100px', opacity: 0.5, textAlign: 'right' }}
              >
                VISITORS
              </Text>
              <Text size="1" weight="medium" style={{ flex: '0 0 80px', opacity: 0.5 }}>
                CHANGE
              </Text>
              <Text size="1" weight="medium" style={{ flex: '0 0 80px', opacity: 0.5 }}>
                ACTIVITY
              </Text>
              <div style={{ flex: '0 0 auto', width: 72 }} />
            </Row>

            {/* Website rows */}
            <Column gap="1">
              {websitesWithMetrics.map((website: any) => (
                <WebsiteRow
                  key={website.id}
                  website={website}
                  isSelected={selectedId === website.id}
                  onSelect={() => setSelectedId(website.id)}
                />
              ))}
            </Column>
          </LoadingPanel>
        </Panel>

        {/* Keyboard hint */}
        <Row justifyContent="center" style={{ opacity: 0.4 }}>
          <Text size="1">Press J/K to navigate, Enter to open</Text>
        </Row>
      </Column>
    </PageBody>
  );
}
