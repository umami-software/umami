'use client';
import { Column } from '@umami/react-zen';
import { useState } from 'react';
import { DataGrid } from '@/components/common/DataGrid';
import { useMobile, useSessionReplaysQuery } from '@/components/hooks';
import { ReplayPlayback } from '../replays/[replayId]/ReplayPlayback';
import { SessionReplaysTable } from './SessionReplaysTable';

function InlinePlayer({
  websiteId,
  replayId,
  onClose,
  isMobile,
}: {
  websiteId: string;
  replayId: string;
  onClose: () => void;
  isMobile: boolean;
}) {
  return (
    <div
      style={{
        padding: isMobile ? '0.75rem 0' : '1.5rem 0',
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
      }}
    >
      <ReplayPlayback
        websiteId={websiteId}
        replayId={replayId}
        showSessionInfo={false}
        onClose={onClose}
      />
    </div>
  );
}

export function SessionReplaysDataTable({
  websiteId,
  sessionId,
}: {
  websiteId: string;
  sessionId: string;
}) {
  const { isMobile } = useMobile();
  const queryResult = useSessionReplaysQuery(websiteId, sessionId);
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const handlePlay = (id: string) => {
    setSelectedId(prev => (prev === id ? undefined : id));
  };

  return (
    <Column width="100%" minWidth="0">
      {selectedId && (
        <InlinePlayer
          websiteId={websiteId}
          replayId={selectedId}
          onClose={() => setSelectedId(undefined)}
          isMobile={isMobile}
        />
      )}
      <DataGrid query={queryResult} allowPaging>
        {({ data }) => (
          <SessionReplaysTable data={data} onPlay={handlePlay as any} selectedId={selectedId} />
        )}
      </DataGrid>
    </Column>
  );
}
