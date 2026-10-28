import { useCallback, useEffect, useRef, useState } from 'react';
import { useApi } from '@/components/hooks';
import type { MonthRange } from './splitRangeByMonth';

export interface ClearCounts {
  events: number;
  eventData: number;
  sessions: number;
  revenue: number;
  replays: number;
  heatmaps: number;
}

export const EMPTY_COUNTS: ClearCounts = {
  events: 0,
  eventData: 0,
  sessions: 0,
  revenue: 0,
  replays: 0,
  heatmaps: 0,
};

export type BatchStatus = 'idle' | 'running' | 'stopping' | 'stopped' | 'error' | 'done';

function addCounts(total: ClearCounts, counts: Partial<ClearCounts>): ClearCounts {
  return {
    events: total.events + (counts?.events ?? 0),
    eventData: total.eventData + (counts?.eventData ?? 0),
    sessions: total.sessions + (counts?.sessions ?? 0),
    revenue: total.revenue + (counts?.revenue ?? 0),
    replays: total.replays + (counts?.replays ?? 0),
    heatmaps: total.heatmaps + (counts?.heatmaps ?? 0),
  };
}

export function useBatchedClear(websiteId: string) {
  const { post } = useApi();
  const [months, setMonths] = useState<MonthRange[]>([]);
  const [completed, setCompleted] = useState(0);
  const [totals, setTotals] = useState<ClearCounts>(EMPTY_COUNTS);
  const [status, setStatus] = useState<BatchStatus>('idle');
  const [error, setError] = useState<Error>();
  const running = useRef(false);
  const stopRequested = useRef(false);

  const run = useCallback(
    async (ranges: MonthRange[], from: number) => {
      if (running.current) {
        return;
      }

      running.current = true;
      stopRequested.current = false;
      setStatus('running');
      setError(undefined);

      try {
        for (let index = from; index < ranges.length; index++) {
          if (stopRequested.current) {
            setStatus('stopped');
            return;
          }

          const counts = await post(`/websites/${websiteId}/clear`, ranges[index]);

          setTotals(total => addCounts(total, counts));
          setCompleted(index + 1);
        }

        setStatus('done');
      } catch (e) {
        setError(e as Error);
        setStatus('error');
      } finally {
        running.current = false;
      }
    },
    [post, websiteId],
  );

  const start = useCallback(
    async (ranges: MonthRange[]) => {
      if (running.current) {
        return;
      }

      setMonths(ranges);
      setCompleted(0);
      setTotals(EMPTY_COUNTS);

      await run(ranges, 0);
    },
    [run],
  );

  const retry = useCallback(() => run(months, completed), [run, months, completed]);

  const stop = useCallback(() => {
    if (running.current) {
      stopRequested.current = true;
      setStatus('stopping');
    }
  }, []);

  const isBusy = status === 'running' || status === 'stopping';

  useEffect(() => {
    if (!isBusy) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Chrome before 119 and older Safari only prompt when returnValue is set.
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isBusy]);

  return {
    months,
    completed,
    current: months[completed],
    totals,
    status,
    error,
    isBusy,
    start,
    stop,
    retry,
  };
}
