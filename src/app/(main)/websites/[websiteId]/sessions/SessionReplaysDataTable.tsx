'use client';
import { Column } from '@umami/react-zen';
import { useState } from 'react';
import { DataGrid } from '@/components/common/DataGrid';
import { useSessionReplaysQuery } from '@/components/hooks';
import { ReplayPlayback } from '../replays/[replayId]/ReplayPlayback';
import { SessionReplaysTable } from './SessionReplaysTable';

function InlinePlayer({
  websiteId,
  replayId,
  onClose,
}: {
  websiteId: string;
  replayId: string;
  onClose: () => void;
}) {
  return (
    <div style={{ padding: '1.5rem 0' }}>
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
  const queryResult = useSessionReplaysQuery(websiteId, sessionId);
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const handlePlay = (id: string) => {
    setSelectedId(prev => (prev === id ? undefined : id));
  };

  return (
    <Column>
      {selectedId && (
        <InlinePlayer
          websiteId={websiteId}
          replayId={selectedId}
          onClose={() => setSelectedId(undefined)}
        />
      )}
      <DataGrid query={queryResult} allowPaging>
        {({ data }) => (
          <SessionReplaysTable data={data} onPlay={handlePlay} selectedId={selectedId} />
        )}
      </DataGrid>
    </Column>
  );
}
