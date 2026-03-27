'use client';
import { Button, Column, Icon, Row } from '@umami/react-zen';
import { useState } from 'react';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useMessages, useNavigation } from '@/components/hooks';
import { LayoutGrid, List } from '@/components/icons';
import { getItem, setItem } from '@/lib/storage';
import { WebsiteAddButton } from './WebsiteAddButton';
import { WebsitesDataTable } from './WebsitesDataTable';
import { WebsitesOverview } from './WebsitesOverview';

const VIEW_KEY = 'umami.websites-view';

export function WebsitesPage() {
  const { teamId } = useNavigation();
  const { formatMessage, labels } = useMessages();
  const [view, setView] = useState<'grid' | 'list'>(() => getItem(VIEW_KEY) ?? 'grid');

  const handleViewChange = (next: 'grid' | 'list') => {
    setView(next);
    setItem(VIEW_KEY, next);
  };

  return (
    <PageBody>
      <Column gap="6" margin="2">
        <PageHeader title={formatMessage(labels.websites)}>
          <Row gap="2" alignItems="center">
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
          <WebsitesOverview teamId={teamId} />
        ) : (
          <Panel>
            <WebsitesDataTable teamId={teamId} />
          </Panel>
        )}
      </Column>
    </PageBody>
  );
}
