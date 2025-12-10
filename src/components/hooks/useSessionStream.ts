import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useSessionStream(websiteId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!websiteId) return;

    const eventSource = new EventSource(`/api/websites/${websiteId}/sessions/stream`);

    eventSource.onmessage = () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    };

    return () => eventSource.close();
  }, [websiteId, queryClient]);
}
