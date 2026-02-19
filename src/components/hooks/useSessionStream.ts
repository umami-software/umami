import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const MAX_RETRY_DELAY = 30000;
const INITIAL_RETRY_DELAY = 1000;

export function useSessionStream(websiteId?: string) {
  const queryClient = useQueryClient();
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!websiteId) return;

    let eventSource: EventSource | null = null;
    let isMounted = true;

    const connect = () => {
      if (!isMounted) return;

      eventSource = new EventSource(`/api/websites/${websiteId}/sessions/stream`);

      eventSource.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          if (data.sessionId) {
            retryCountRef.current = 0;
            queryClient.invalidateQueries({ queryKey: ['sessions', { websiteId }] });
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to parse session event:', error);
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();

        if (!isMounted) return;

        const delay = Math.min(
          INITIAL_RETRY_DELAY * Math.pow(2, retryCountRef.current),
          MAX_RETRY_DELAY,
        );
        retryCountRef.current += 1;

        retryTimeoutRef.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      eventSource?.close();
    };
  }, [websiteId, queryClient]);
}
