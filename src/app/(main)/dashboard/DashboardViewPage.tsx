'use client';
import { Column, Heading, Row, Text } from '@umami/react-zen';
import { useEffect } from 'react';
import { BoardControls } from '@/app/(main)/boards/[boardId]/BoardControls';
import { BoardViewBody } from '@/app/(main)/boards/[boardId]/BoardViewBody';
import { LinkButton } from '@/components/common/LinkButton';
import { PageBody } from '@/components/common/PageBody';
import { useBoard, useNavigation } from '@/components/hooks';
import { LayoutDashboard } from '@/components/icons';
import { DashboardProvider } from './DashboardProvider';
import { DashboardViewHeader } from './DashboardViewHeader';

function DashboardContent() {
  const { board } = useBoard();
  const { renderUrl } = useNavigation();
  const rows = board?.parameters?.rows ?? [];
  const hasComponents = rows.some(row => row.columns?.some(column => !!column.component));

  if (!hasComponents) {
    return (
      <Column alignItems="center" gap="4" paddingY="10" className="glass-enter">
        <Heading size="xl">Build your dashboard</Heading>
        <Text color="muted">
          Add widgets for any of your sites: key metrics, visitors chart, top pages, traffic
          sources, events, world map and more. Pick a site and period for each widget.
        </Text>
        <Row gap="2" wrap="wrap" justifyContent="center">
          {[
            'Key metrics',
            'Visitors chart',
            'Top pages',
            'Traffic sources',
            'Events',
            'World map',
          ].map(name => (
            <span key={name} className="glass-chip">
              {name}
            </span>
          ))}
        </Row>
        <LinkButton variant="primary" href={renderUrl('/dashboard/edit', false)}>
          <LayoutDashboard size={16} /> Add widgets
        </LinkButton>
      </Column>
    );
  }

  return <BoardViewBody />;
}

export function DashboardViewPage() {
  const { teamId, router } = useNavigation();

  useEffect(() => {
    if (teamId) {
      router.replace('/dashboard');
    }
  }, [teamId, router]);

  if (teamId) {
    return null;
  }

  return (
    <DashboardProvider>
      <PageBody>
        <Column>
          <DashboardViewHeader />
          <BoardControls />
          <DashboardContent />
        </Column>
      </PageBody>
    </DashboardProvider>
  );
}
