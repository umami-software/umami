'use client';

import { useQuery } from '@tanstack/react-query';
import { Button, Column, Grid, Icon, Row, SearchField, Text } from '@umami/react-zen';
import { ExternalLink, Eye, Globe, Settings, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Favicon } from '@/components/common/Favicon';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { useApi } from '@/components/hooks';

// Realistic sample data for the prototype
const SAMPLE_WEBSITES = [
  {
    id: '1',
    name: 'Hulu',
    domain: 'hulu.com',
    pageviews: 2847293,
    visitors: 892341,
    bounceRate: 32.4,
    avgDuration: 245,
  },
  {
    id: '2',
    name: 'Disney+',
    domain: 'disneyplus.com',
    pageviews: 1923847,
    visitors: 634892,
    bounceRate: 28.7,
    avgDuration: 312,
  },
  {
    id: '3',
    name: 'ESPN',
    domain: 'espn.com',
    pageviews: 3421987,
    visitors: 1234567,
    bounceRate: 41.2,
    avgDuration: 189,
  },
  {
    id: '4',
    name: 'FX Networks',
    domain: 'fxnetworks.com',
    pageviews: 892341,
    visitors: 312456,
    bounceRate: 35.8,
    avgDuration: 267,
  },
  {
    id: '5',
    name: 'ABC',
    domain: 'abc.com',
    pageviews: 1567234,
    visitors: 523891,
    bounceRate: 38.1,
    avgDuration: 198,
  },
  {
    id: '6',
    name: 'National Geographic',
    domain: 'nationalgeographic.com',
    pageviews: 743219,
    visitors: 287654,
    bounceRate: 29.3,
    avgDuration: 342,
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

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface WebsiteCardProps {
  website: (typeof SAMPLE_WEBSITES)[0];
}

function WebsiteCard({ website }: WebsiteCardProps) {
  return (
    <Column
      backgroundColor
      border
      borderRadius="3"
      padding="5"
      gap="4"
      style={{
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        cursor: 'pointer',
      }}
    >
      {/* Header with favicon and name */}
      <Row alignItems="center" justifyContent="space-between">
        <Row alignItems="center" gap="3">
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: 'var(--base-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <Favicon domain={website.domain} style={{ width: 24, height: 24 }} />
          </div>
          <Column gap="1">
            <Link
              href={`/websites/${website.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Text size="3" weight="semibold">
                {website.name}
              </Text>
            </Link>
            <Row alignItems="center" gap="1">
              <Globe size={12} style={{ opacity: 0.5 }} />
              <Text size="1" style={{ opacity: 0.6 }}>
                {website.domain}
              </Text>
            </Row>
          </Column>
        </Row>
        <Link href={`/websites/${website.id}/settings`}>
          <Button variant="quiet" size="sm">
            <Icon>
              <Settings size={16} />
            </Icon>
          </Button>
        </Link>
      </Row>

      {/* Metrics grid */}
      <Grid columns={{ xs: 2, sm: 2 }} gap="3">
        <Column backgroundColor="var(--base-100)" borderRadius="2" padding="3" gap="1">
          <Row alignItems="center" gap="2">
            <Eye size={14} style={{ opacity: 0.5 }} />
            <Text size="1" style={{ opacity: 0.6 }}>
              Page Views
            </Text>
          </Row>
          <Text size="4" weight="bold">
            {formatNumber(website.pageviews)}
          </Text>
        </Column>

        <Column backgroundColor="var(--base-100)" borderRadius="2" padding="3" gap="1">
          <Row alignItems="center" gap="2">
            <Users size={14} style={{ opacity: 0.5 }} />
            <Text size="1" style={{ opacity: 0.6 }}>
              Visitors
            </Text>
          </Row>
          <Text size="4" weight="bold">
            {formatNumber(website.visitors)}
          </Text>
        </Column>

        <Column backgroundColor="var(--base-100)" borderRadius="2" padding="3" gap="1">
          <Row alignItems="center" gap="2">
            <TrendingUp size={14} style={{ opacity: 0.5 }} />
            <Text size="1" style={{ opacity: 0.6 }}>
              Bounce Rate
            </Text>
          </Row>
          <Text size="4" weight="bold">
            {website.bounceRate}%
          </Text>
        </Column>

        <Column backgroundColor="var(--base-100)" borderRadius="2" padding="3" gap="1">
          <Row alignItems="center" gap="2">
            <Icon size="sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </Icon>
            <Text size="1" style={{ opacity: 0.6 }}>
              Avg. Duration
            </Text>
          </Row>
          <Text size="4" weight="bold">
            {formatDuration(website.avgDuration)}
          </Text>
        </Column>
      </Grid>

      {/* Action row */}
      <Row justifyContent="flex-end" gap="2">
        <Link href={`/websites/${website.id}`}>
          <Button variant="primary" size="sm">
            View Analytics
            <Icon>
              <ExternalLink size={14} />
            </Icon>
          </Button>
        </Link>
      </Row>
    </Column>
  );
}

export default function WebsitesCardGridPage() {
  const [search, setSearch] = useState('');
  const { get } = useApi();

  // Try to fetch real data, fall back to sample data
  const { data, isLoading, error } = useQuery({
    queryKey: ['websites-prototype'],
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
  const websitesWithMetrics = filteredWebsites.map((site: any) => ({
    ...site,
    pageviews: site.pageviews || Math.floor(Math.random() * 3000000) + 500000,
    visitors: site.visitors || Math.floor(Math.random() * 1000000) + 200000,
    bounceRate: site.bounceRate || Math.floor(Math.random() * 30) + 25,
    avgDuration: site.avgDuration || Math.floor(Math.random() * 200) + 150,
  }));

  return (
    <PageBody>
      <Column gap="6" margin="2">
        <PageHeader title="Websites" />

        {/* Search and filters */}
        <Row alignItems="center" justifyContent="space-between" gap="4">
          <SearchField
            value={search}
            onSearch={setSearch}
            placeholder="Search websites..."
            style={{ maxWidth: 320 }}
          />
          <Row gap="2">
            <Button variant="secondary" size="sm">
              Sort by Views
            </Button>
            <Button variant="primary">Add Website</Button>
          </Row>
        </Row>

        {/* Cards grid */}
        <LoadingPanel isLoading={isLoading} data={websitesWithMetrics}>
          <Grid columns={{ xs: 1, sm: 2, lg: 3 }} gap="4">
            {websitesWithMetrics.map((website: any) => (
              <WebsiteCard key={website.id} website={website} />
            ))}
          </Grid>
        </LoadingPanel>

        {/* Summary footer */}
        <Row justifyContent="center" padding="4" style={{ opacity: 0.6 }}>
          <Text size="1">Showing {websitesWithMetrics.length} websites</Text>
        </Row>
      </Column>
    </PageBody>
  );
}
