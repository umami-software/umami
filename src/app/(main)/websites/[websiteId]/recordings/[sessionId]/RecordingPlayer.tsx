'use client';
import { Column } from '@umami/react-zen';
import { useEffect, useRef, useState } from 'react';
import 'rrweb-player/dist/style.css';

export function RecordingPlayer({ events }: { events: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !events?.length) return;

    // Debug: log event info
    const typeCounts: Record<number, number> = {};
    events.forEach((e: any) => {
      typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
    });
    const timestamps = events.map((e: any) => e.timestamp).filter(Boolean);
    console.log('[RecordingPlayer] Events:', events.length, 'Types:', typeCounts);
    console.log(
      '[RecordingPlayer] Time range:',
      timestamps.length
        ? `${Math.min(...timestamps)} - ${Math.max(...timestamps)} (${Math.max(...timestamps) - Math.min(...timestamps)}ms)`
        : 'no timestamps',
    );
    console.log('[RecordingPlayer] First 3 events:', events.slice(0, 3));

    // Dynamically import rrweb-player to avoid SSR issues
    import('rrweb-player').then(mod => {
      const RRWebPlayer = mod.default;

      // Clear any previous player
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      playerRef.current = new RRWebPlayer({
        target: containerRef.current!,
        props: {
          events,
          width: 1024,
          height: 576,
          autoPlay: false,
          showController: true,
          speedOption: [1, 2, 4, 8],
        },
      });

      setLoaded(true);
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.$destroy?.();
        playerRef.current = null;
      }
    };
  }, [events]);

  return (
    <Column alignItems="center">
      <div
        ref={containerRef}
        style={{
          minWidth: 1024,
          minHeight: loaded ? undefined : 576,
          maxWidth: '100%',
          overflow: 'hidden',
          borderRadius: '8px',
          border: '1px solid var(--base300)',
          background: 'var(--base75)',
        }}
      />
    </Column>
  );
}
