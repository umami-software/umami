'use client';
import { useMobile } from '@/components/hooks';
import { Column } from '@umami/react-zen';
import { useEffect, useRef, useState } from 'react';
import 'rrweb-player/dist/style.css';

export function ReplayPlayer({ events }: { events: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const { isMobile, isPhone } = useMobile();

  const playerWidth = isPhone ? 360 : isMobile ? 640 : 1024;
  const playerHeight = isPhone ? 202 : isMobile ? 360 : 576;

  useEffect(() => {
    if (!containerRef.current || !events?.length) return;

    Promise.all([import('rrweb-player'), import('@rrweb/rrweb-plugin-console-replay')]).then(
      ([mod, consoleMod]) => {
        const RRWebPlayer = mod.default;
        const { getReplayConsolePlugin } = consoleMod;

        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        const hasConsole = events.some(event => event.data?.plugin === 'rrweb/console@1');

        playerRef.current = new RRWebPlayer({
          target: containerRef.current,
          props: {
            events: events,
            width: playerWidth,
            height: playerHeight,
            autoPlay: false,
            showController: true,
            speedOption: [1, 2, 4, 8],
            useVirtualDom: false,
            showWarning: false,
            plugins: hasConsole ? [getReplayConsolePlugin()] : [],
          },
        });

        setLoaded(true);
      },
    );

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
