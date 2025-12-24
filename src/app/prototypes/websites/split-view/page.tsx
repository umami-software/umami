'use client';

import { useQuery } from '@tanstack/react-query';
import { Button, Column, Grid, Icon, Row, SearchField, Text } from '@umami/react-zen';
import {
  ArrowUpRight,
  BarChart3,
  Clock,
  ExternalLink,
  Eye,
  Globe,
  MapPin,
  Monitor,
  Settings,
  Smartphone,
  TrendingUp,
  Users,
} from 'lucide-react';
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
    bounceRate: 32.4,
    avgDuration: 245,
    topCountries: ['United States', 'Canada', 'United Kingdom'],
    topPages: ['/home', '/browse', '/watch', '/account', '/search'],
    deviceSplit: { desktop: 42, mobile: 48, tablet: 10 },
    createdAt: '2023-06-15',
  },
  {
    id: '2',
    name: 'Disney+',
    domain: 'disneyplus.com',
    pageviews: 1923847,
    visitors: 634892,
    bounceRate: 28.7,
    avgDuration: 312,
    topCountries: ['United States', 'Brazil', 'Mexico'],
    topPages: ['/home', '/movies', '/series', '/kids', '/profile'],
    deviceSplit: { desktop: 35, mobile: 55, tablet: 10 },
    createdAt: '2023-04-22',
  },
  {
    id: '3',
    name: 'ESPN',
    domain: 'espn.com',
    pageviews: 3421987,
    visitors: 1234567,
    bounceRate: 41.2,
    avgDuration: 189,
    topCountries: ['United States', 'United Kingdom', 'Australia'],
    topPages: ['/scores', '/nfl', '/nba', '/mlb', '/soccer'],
    deviceSplit: { desktop: 55, mobile: 38, tablet: 7 },
    createdAt: '2023-02-10',
  },
  {
    id: '4',
    name: 'FX Networks',
    domain: 'fxnetworks.com',
    pageviews: 892341,
    visitors: 312456,
    bounceRate: 35.8,
    avgDuration: 267,
    topCountries: ['United States', 'Canada', 'Germany'],
    topPages: ['/shows', '/schedule', '/videos', '/about'],
    deviceSplit: { desktop: 48, mobile: 42, tablet: 10 },
    createdAt: '2023-08-05',
  },
  {
    id: '5',
    name: 'ABC',
    domain: 'abc.com',
    pageviews: 1567234,
    visitors: 523891,
    bounceRate: 38.1,
    avgDuration: 198,
    topCountries: ['United States', 'Canada', 'Philippines'],
    topPages: ['/shows', '/news', '/live', '/schedule'],
    deviceSplit: { desktop: 40, mobile: 50, tablet: 10 },
    createdAt: '2023-03-18',
  },
  {
    id: '6',
    name: 'National Geographic',
    domain: 'nationalgeographic.com',
    pageviews: 743219,
    visitors: 287654,
    bounceRate: 29.3,
    avgDuration: 342,
    topCountries: ['United States', 'United Kingdom', 'India'],
    topPages: ['/animals', '/science', '/travel', '/environment'],
    deviceSplit: { desktop: 52, mobile: 38, tablet: 10 },
    createdAt: '2023-05-30',
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
  return `${mins}m ${secs}s`;
}

interface WebsiteListItemProps {
  website: (typeof SAMPLE_WEBSITES)[0];
  isSelected: boolean;
  onSelect: () => void;
}

function WebsiteListItem({ website, isSelected, onSelect }: WebsiteListItemProps) {
  return (
    <Row
      alignItems="center"
      padding="4"
      gap="3"
      onClick={onSelect}
      style={{
        cursor: 'pointer',
        backgroundColor: isSelected
          ? 'var(--primary-color-alpha-10, rgba(20, 122, 243, 0.1))'
          : 'transparent',
        borderLeft: isSelected ? '3px solid var(--primary-color)' : '3px solid transparent',
        transition: 'all 0.15s ease',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          backgroundColor: 'var(--base-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Favicon domain={website.domain} style={{ width: 20, height: 20 }} />
      </div>
      <Column gap="1" style={{ flex: 1, minWidth: 0 }}>
        <Text size="2" weight="semibold" wrap="nowrap">
          {website.name}
        </Text>
        <Text size="1" style={{ opacity: 0.5 }} wrap="nowrap">
          {website.domain}
        </Text>
      </Column>
      <Column alignItems="flex-end" gap="1">
        <Text size="2" weight="medium">
          {formatNumber(website.visitors)}
        </Text>
        <Text size="1" style={{ opacity: 0.5 }}>
          visitors
        </Text>
      </Column>
    </Row>
  );
}

interface DetailPanelProps {
  website: (typeof SAMPLE_WEBSITES)[0] | null;
}

function DetailPanel({ website }: DetailPanelProps) {
  if (!website) {
    return (
      <Column
        flex="1"
        alignItems="center"
        justifyContent="center"
        backgroundColor
        border
        borderRadius="3"
        style={{ minHeight: 500 }}
      >
        <Column alignItems="center" gap="3" style={{ opacity: 0.5 }}>
          <BarChart3 size={48} strokeWidth={1} />
          <Text size="2">Select a website to view details</Text>
        </Column>
      </Column>
    );
  }

  return (
    <Column
      flex="1"
      backgroundColor
      border
      borderRadius="3"
      padding="6"
      gap="6"
      style={{ minHeight: 500 }}
    >
      {/* Header */}
      <Row alignItems="center" justifyContent="space-between">
        <Row alignItems="center" gap="4">
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              backgroundColor: 'var(--base-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Favicon domain={website.domain} style={{ width: 32, height: 32 }} />
          </div>
          <Column gap="1">
            <Text size="5" weight="bold">
              {website.name}
            </Text>
            <Row alignItems="center" gap="2">
              <Globe size={14} style={{ opacity: 0.5 }} />
              <Text size="2" style={{ opacity: 0.6 }}>
                {website.domain}
              </Text>
            </Row>
          </Column>
        </Row>
        <Row gap="2">
          <Link href={`/websites/${website.id}/settings`}>
            <Button variant="secondary" size="sm">
              <Icon>
                <Settings size={14} />
              </Icon>
              Settings
            </Button>
          </Link>
          <Link href={`/websites/${website.id}`}>
            <Button variant="primary" size="sm">
              View Full Analytics
              <Icon>
                <ExternalLink size={14} />
              </Icon>
            </Button>
          </Link>
        </Row>
      </Row>

      {/* Key metrics */}
      <Grid columns={{ xs: 2, md: 4 }} gap="4">
        <Column backgroundColor="var(--base-100)" borderRadius="3" padding="4" gap="2">
          <Row alignItems="center" gap="2">
            <Eye size={16} style={{ opacity: 0.5 }} />
            <Text size="1" style={{ opacity: 0.6 }}>
              Page Views
            </Text>
          </Row>
          <Row alignItems="baseline" gap="2">
            <Text size="6" weight="bold">
              {formatNumber(website.pageviews)}
            </Text>
            <Row alignItems="center" style={{ color: 'var(--green-500, #22c55e)' }}>
              <ArrowUpRight size={12} />
              <Text size="1">12%</Text>
            </Row>
          </Row>
        </Column>

        <Column backgroundColor="var(--base-100)" borderRadius="3" padding="4" gap="2">
          <Row alignItems="center" gap="2">
            <Users size={16} style={{ opacity: 0.5 }} />
            <Text size="1" style={{ opacity: 0.6 }}>
              Visitors
            </Text>
          </Row>
          <Row alignItems="baseline" gap="2">
            <Text size="6" weight="bold">
              {formatNumber(website.visitors)}
            </Text>
            <Row alignItems="center" style={{ color: 'var(--green-500, #22c55e)' }}>
              <ArrowUpRight size={12} />
              <Text size="1">8%</Text>
            </Row>
          </Row>
        </Column>

        <Column backgroundColor="var(--base-100)" borderRadius="3" padding="4" gap="2">
          <Row alignItems="center" gap="2">
            <TrendingUp size={16} style={{ opacity: 0.5 }} />
            <Text size="1" style={{ opacity: 0.6 }}>
              Bounce Rate
            </Text>
          </Row>
          <Text size="6" weight="bold">
            {website.bounceRate}%
          </Text>
        </Column>

        <Column backgroundColor="var(--base-100)" borderRadius="3" padding="4" gap="2">
          <Row alignItems="center" gap="2">
            <Clock size={16} style={{ opacity: 0.5 }} />
            <Text size="1" style={{ opacity: 0.6 }}>
              Avg. Duration
            </Text>
          </Row>
          <Text size="6" weight="bold">
            {formatDuration(website.avgDuration)}
          </Text>
        </Column>
      </Grid>

      {/* Additional info */}
      <Grid columns={{ xs: 1, md: 2 }} gap="4">
        {/* Top Pages */}
        <Column gap="3">
          <Text size="2" weight="semibold">
            Top Pages
          </Text>
          <Column backgroundColor="var(--base-100)" borderRadius="3" padding="3" gap="2">
            {website.topPages.map((page, i) => (
              <Row
                key={page}
                alignItems="center"
                justifyContent="space-between"
                padding="2"
                style={{
                  borderBottom:
                    i < website.topPages.length - 1 ? '1px solid var(--base-200)' : 'none',
                }}
              >
                <Text size="2">{page}</Text>
                <Text size="1" style={{ opacity: 0.5 }}>
                  {formatNumber(Math.floor(website.pageviews / (i + 2)))}
                </Text>
              </Row>
            ))}
          </Column>
        </Column>

        {/* Device breakdown & Countries */}
        <Column gap="3">
          <Text size="2" weight="semibold">
            Device Breakdown
          </Text>
          <Column backgroundColor="var(--base-100)" borderRadius="3" padding="4" gap="3">
            <Row alignItems="center" justifyContent="space-between">
              <Row alignItems="center" gap="2">
                <Monitor size={14} style={{ opacity: 0.6 }} />
                <Text size="2">Desktop</Text>
              </Row>
              <Row alignItems="center" gap="2">
                <div
                  style={{
                    width: 60,
                    height: 6,
                    backgroundColor: 'var(--base-300)',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${website.deviceSplit.desktop}%`,
                      height: '100%',
                      backgroundColor: 'var(--primary-color)',
                      borderRadius: 3,
                    }}
                  />
                </div>
                <Text size="2" weight="medium">
                  {website.deviceSplit.desktop}%
                </Text>
              </Row>
            </Row>
            <Row alignItems="center" justifyContent="space-between">
              <Row alignItems="center" gap="2">
                <Smartphone size={14} style={{ opacity: 0.6 }} />
                <Text size="2">Mobile</Text>
              </Row>
              <Row alignItems="center" gap="2">
                <div
                  style={{
                    width: 60,
                    height: 6,
                    backgroundColor: 'var(--base-300)',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${website.deviceSplit.mobile}%`,
                      height: '100%',
                      backgroundColor: 'var(--green-500, #22c55e)',
                      borderRadius: 3,
                    }}
                  />
                </div>
                <Text size="2" weight="medium">
                  {website.deviceSplit.mobile}%
                </Text>
              </Row>
            </Row>
            <Row alignItems="center" justifyContent="space-between">
              <Row alignItems="center" gap="2">
                <Icon size="sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12" y2="18" />
                  </svg>
                </Icon>
                <Text size="2">Tablet</Text>
              </Row>
              <Row alignItems="center" gap="2">
                <div
                  style={{
                    width: 60,
                    height: 6,
                    backgroundColor: 'var(--base-300)',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${website.deviceSplit.tablet}%`,
                      height: '100%',
                      backgroundColor: 'var(--orange-500, #f97316)',
                      borderRadius: 3,
                    }}
                  />
                </div>
                <Text size="2" weight="medium">
                  {website.deviceSplit.tablet}%
                </Text>
              </Row>
            </Row>
          </Column>

          <Text size="2" weight="semibold" style={{ marginTop: 8 }}>
            Top Countries
          </Text>
          <Row gap="2" wrap="wrap">
            {website.topCountries.map(country => (
              <Row
                key={country}
                alignItems="center"
                gap="2"
                backgroundColor="var(--base-100)"
                borderRadius="2"
                padding="2"
                paddingX="3"
              >
                <MapPin size={12} style={{ opacity: 0.5 }} />
                <Text size="1">{country}</Text>
              </Row>
            ))}
          </Row>
        </Column>
      </Grid>
    </Column>
  );
}

export default function WebsitesSplitViewPage() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>('1');
  const { get } = useApi();

  // Try to fetch real data, fall back to sample data
  const { data, isLoading } = useQuery({
    queryKey: ['websites-prototype-split'],
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
    ...SAMPLE_WEBSITES[index % SAMPLE_WEBSITES.length],
    ...site,
    pageviews: site.pageviews || SAMPLE_WEBSITES[index % SAMPLE_WEBSITES.length].pageviews,
    visitors: site.visitors || SAMPLE_WEBSITES[index % SAMPLE_WEBSITES.length].visitors,
  }));

  const selectedWebsite = websitesWithMetrics.find((w: any) => w.id === selectedId) || null;

  return (
    <PageBody>
      <Column gap="5" margin="2">
        <PageHeader title="Websites">
          <Button variant="primary">Add Website</Button>
        </PageHeader>

        <Row gap="5" alignItems="flex-start" style={{ minHeight: 600 }}>
          {/* Left sidebar - website list */}
          <Column style={{ width: 320, flexShrink: 0 }} backgroundColor border borderRadius="3">
            <Column padding="4" style={{ borderBottom: '1px solid var(--base-300)' }}>
              <SearchField value={search} onSearch={setSearch} placeholder="Search websites..." />
            </Column>

            <LoadingPanel isLoading={isLoading} data={websitesWithMetrics}>
              <Column style={{ maxHeight: 500, overflowY: 'auto' }}>
                {websitesWithMetrics.map((website: any) => (
                  <WebsiteListItem
                    key={website.id}
                    website={website}
                    isSelected={selectedId === website.id}
                    onSelect={() => setSelectedId(website.id)}
                  />
                ))}
              </Column>
            </LoadingPanel>

            <Row
              padding="3"
              justifyContent="center"
              style={{ borderTop: '1px solid var(--base-300)', opacity: 0.5 }}
            >
              <Text size="1">{websitesWithMetrics.length} websites</Text>
            </Row>
          </Column>

          {/* Right panel - details */}
          <DetailPanel website={selectedWebsite} />
        </Row>
      </Column>
    </PageBody>
  );
}
