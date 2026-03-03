'use client';
import { Column } from '@umami/react-zen';
import { useEffect, useRef, useState } from 'react';
import { useMobile } from '@/components/hooks';
import 'rrweb-player/dist/style.css';

function normalizeEvents(events: any[], maxGapMs = 60_000): any[] {
  if (events.length < 2) return events;

  const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
  let shift = 0;
  const result: any[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].timestamp - sorted[i - 1].timestamp;
    if (gap > maxGapMs) {
      shift += gap - 1000;
    }
    result.push(shift > 0 ? { ...sorted[i], timestamp: sorted[i].timestamp - shift } : sorted[i]);
  }

  return result;
}

export function ReplayPlayer({ events }: { events: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const { isMobile, isPhone } = useMobile();

  const playerWidth = isPhone ? 360 : isMobile ? 640 : 1024;
  const playerHeight = isPhone ? 202 : isMobile ? 360 : 576;

  useEffect(() => {
    if (!containerRef.current || !events?.length) return;

    import('rrweb-player').then(mod => {
      const RRWebPlayer = mod.default;

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      playerRef.current = new RRWebPlayer({
        target: containerRef.current,
        props: {
          events: normalizeEvents(events),
          width: playerWidth,
          height: playerHeight,
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
  }, [events, playerWidth, playerHeight]);

  return (
    <Column alignItems="center">
      <div
        ref={containerRef}
        style={{
          width: playerWidth,
          minHeight: loaded ? undefined : playerHeight,
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
