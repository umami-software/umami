export const RRWEB_EVENT_TYPE = {
  Meta: 4,
  FullSnapshot: 2,
} as const;

export const REPLAY_EVENT_FRAGMENT_TYPE = 'umami:rrweb-event-fragment';

interface ReplayEventFragment {
  type: typeof REPLAY_EVENT_FRAGMENT_TYPE;
  timestamp?: number;
  data: {
    id: string;
    index: number;
    total: number;
    value: string;
  };
}

export function isReplayEventFragment(event: any): event is ReplayEventFragment {
  const { data } = event || {};

  return (
    event?.type === REPLAY_EVENT_FRAGMENT_TYPE &&
    typeof data?.id === 'string' &&
    Number.isInteger(data?.index) &&
    Number.isInteger(data?.total) &&
    data.index >= 0 &&
    data.index < data.total &&
    typeof data?.value === 'string'
  );
}

export function getReplayEventCount(events: any[] | null | undefined) {
  if (!Array.isArray(events)) {
    return 0;
  }

  return events.reduce((count, event) => {
    if (isReplayEventFragment(event)) {
      return count + (event.data.index === 0 ? 1 : 0);
    }

    return count + 1;
  }, 0);
}

export function restoreReplayEventFragments(events: any[] | null | undefined) {
  if (!Array.isArray(events)) {
    return [];
  }

  const restored: any[] = [];
  const pending = new Map<
    string,
    {
      total: number;
      values: Map<number, string>;
      received: number;
    }
  >();

  for (const event of events) {
    if (!isReplayEventFragment(event)) {
      restored.push(event);
      continue;
    }

    const { id, index, total, value } = event.data;
    let fragment = pending.get(id);

    if (!fragment || fragment.total !== total) {
      fragment = {
        total,
        values: new Map(),
        received: 0,
      };
      pending.set(id, fragment);
    }

    if (!fragment.values.has(index)) {
      fragment.values.set(index, value);
      fragment.received += 1;
    }

    if (fragment.received === fragment.total) {
      pending.delete(id);

      try {
        let serialized = '';

        for (let i = 0; i < fragment.total; i++) {
          serialized += fragment.values.get(i) || '';
        }

        restored.push(JSON.parse(serialized));
      } catch {
        // Ignore malformed fragment groups. A partial replay is better than failing the whole response.
      }
    }
  }

  return restored;
}

export function hasReplayFullSnapshot(events: any[] | null | undefined) {
  return (
    Array.isArray(events) && events.some(event => event?.type === RRWEB_EVENT_TYPE.FullSnapshot)
  );
}

export function hasReplayableFullSnapshot(events: any[] | null | undefined) {
  return (
    Array.isArray(events) &&
    events.some(event => {
      const { data } = event || {};
      const { node } = data || {};

      return (
        event?.type === RRWEB_EVENT_TYPE.FullSnapshot &&
        Number.isInteger(node?.type) &&
        Array.isArray(node?.childNodes)
      );
    })
  );
}

export function hasReplayMeta(events: any[] | null | undefined) {
  return Array.isArray(events) && events.some(event => event?.type === RRWEB_EVENT_TYPE.Meta);
}

function getReplayDimension(value: any) {
  const dimension = Number(value);

  return Number.isFinite(dimension) && dimension > 0 ? dimension : null;
}

export function getReplayViewport(events: any[] | null | undefined) {
  if (!Array.isArray(events)) {
    return null;
  }

  const meta = events.find(event => {
    const width = getReplayDimension(event?.data?.width);
    const height = getReplayDimension(event?.data?.height);

    return event?.type === RRWEB_EVENT_TYPE.Meta && width && height;
  });

  if (!meta) {
    return null;
  }

  return {
    width: getReplayDimension(meta.data.width) as number,
    height: getReplayDimension(meta.data.height) as number,
  };
}

function getReplayTimestamp(event: any) {
  const timestamp = Number(event?.timestamp);

  return Number.isFinite(timestamp) ? timestamp : null;
}

export function getReplayPlayerEvents(events: any[] | null | undefined) {
  if (!Array.isArray(events)) {
    return [];
  }

  const replayEvents = events.filter(
    event => event && typeof event === 'object' && event.type !== undefined && event.type !== null,
  );

  if (!hasReplayableFullSnapshot(replayEvents)) {
    return [];
  }

  const firstTimestamp =
    replayEvents.map(getReplayTimestamp).find(timestamp => timestamp !== null) ?? Date.now();
  let lastTimestamp = firstTimestamp - 1;

  const normalizedEvents = replayEvents.map(event => {
    const timestamp = getReplayTimestamp(event);

    if (timestamp !== null) {
      lastTimestamp = timestamp;

      return typeof event.timestamp === 'number' ? event : { ...event, timestamp };
    }

    lastTimestamp += 1;

    return { ...event, timestamp: lastTimestamp };
  });

  if (normalizedEvents.length === 1) {
    return [
      normalizedEvents[0],
      {
        ...normalizedEvents[0],
        timestamp: normalizedEvents[0].timestamp + 1,
      },
    ];
  }

  return normalizedEvents;
}

export function canReplayEvents(events: any[] | null | undefined) {
  return getReplayPlayerEvents(events).length >= 2;
}
