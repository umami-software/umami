'use client';
import { Column } from '@umami/react-zen';
import { useState } from 'react';
import { DataGrid } from '@/components/common/DataGrid';
import { useReplayQuery, useSessionReplaysQuery } from '@/components/hooks';
import { ReplayPlayer } from '../replays/[replayId]/ReplayPlayer';
import { SessionReplaysTable } from './SessionReplaysTable';

function InlinePlayer({ websiteId, replayId }: { websiteId: string; replayId: string }) {
  const { data: replay } = useReplayQuery(websiteId, replayId);

  if (!replay?.events?.length) return null;

  return (
    <div style={{ padding: '1.5rem 0' }}>
      <ReplayPlayer events={replay.events} />
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
      {selectedId && <InlinePlayer websiteId={websiteId} replayId={selectedId} />}
      <DataGrid query={queryResult} allowPaging>
        {({ data }) => (
          <SessionReplaysTable data={data} onPlay={handlePlay} selectedId={selectedId} />
        )}
      </DataGrid>
    </Column>
  );
}
