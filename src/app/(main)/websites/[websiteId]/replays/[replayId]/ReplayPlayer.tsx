'use client';
import { Column } from '@umami/react-zen';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Empty } from '@/components/common/Empty';
import { useMobile } from '@/components/hooks';
import { getReplayPlayerEvents, getReplayViewport } from '@/lib/replay';
import 'rrweb-player/dist/style.css';

const DEFAULT_REPLAY_ASPECT_RATIO = 9 / 16;

function destroyReplayPlayer(player: { $destroy?: () => void } | null) {
  if (!player) {
    return;
  }

  try {
    player.$destroy?.();
  } catch (error) {
    // rrweb-player alpha teardown can throw after it loses its inner replayer instance.
    if (!(error instanceof TypeError) || !error.message.includes('pause is not a function')) {
      throw error;
    }
  }
}

export function ReplayPlayer({ events }: { events: any[] }) {
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const playerRootRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [playerError, setPlayerError] = useState(false);
  const [availableWidth, setAvailableWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(
    () => (typeof window !== 'undefined' ? window.innerHeight : 0),
  );
  const { isMobile, isPhone } = useMobile();
  const replayEvents = useMemo(() => getReplayPlayerEvents(events), [events]);
  const replayViewport = useMemo(() => getReplayViewport(replayEvents), [replayEvents]);
  const canReplay = replayEvents.length >= 2;
  const showUnavailable = !events?.length || !canReplay || playerError;

  const preferredPlayerWidth = isPhone ? 360 : isMobile ? 640 : 1024;
  const replayAspectRatio = replayViewport
    ? replayViewport.height / replayViewport.width
    : DEFAULT_REPLAY_ASPECT_RATIO;
  const isPortraitReplay = replayViewport
    ? replayViewport.height > replayViewport.width
    : false;
  const fittedAspectRatio = isPortraitReplay
    ? Math.min(Math.max(replayAspectRatio, DEFAULT_REPLAY_ASPECT_RATIO), 2.25)
    : Math.min(Math.max(replayAspectRatio, DEFAULT_REPLAY_ASPECT_RATIO), 1.5);
  const maxPortraitPlayerHeight = Math.max(
    240,
    Math.round((viewportHeight || 900) * (isMobile ? (isPhone ? 0.55 : 0.6) : 0.88)),
  );
  let playerWidth = Math.min(preferredPlayerWidth, availableWidth || preferredPlayerWidth);
  let playerHeight = Math.round(playerWidth * fittedAspectRatio);

  // Portrait/mobile-recorded replays need to shrink to the visible viewport,
  // otherwise the player keeps a large desktop frame with a tiny phone replay inside it.
  if (isPortraitReplay && playerHeight > maxPortraitPlayerHeight) {
    playerHeight = maxPortraitPlayerHeight;
    playerWidth = Math.max(1, Math.round(playerHeight / fittedAspectRatio));
  }

  const playerOuterHeight = playerHeight + 80;

  useEffect(() => {
    const updateAvailableSize = () => {
      const width = playerWrapperRef.current?.clientWidth ?? 0;

      setAvailableWidth(current => (current === width ? current : width));
      setViewportHeight(current => (current === window.innerHeight ? current : window.innerHeight));
    };

    updateAvailableSize();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateAvailableSize) : null;

    if (playerWrapperRef.current && resizeObserver) {
      resizeObserver.observe(playerWrapperRef.current);
    }

    window.addEventListener('resize', updateAvailableSize);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateAvailableSize);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const playerRoot = playerRootRef.current;

    setPlayerError(false);

    if (playerRef.current) {
      destroyReplayPlayer(playerRef.current);
      playerRef.current = null;
    }

    playerRoot?.replaceChildren();

    if (!playerRoot || !canReplay) return;

    import('rrweb-player')
      .then(mod => {
        if (cancelled) return;

        const RRWebPlayer = mod.default;

        playerRoot.replaceChildren();

        try {
          const player = new RRWebPlayer({
            target: playerRoot,
            props: {
              events: replayEvents,
              width: playerWidth,
              height: playerHeight,
              autoPlay: false,
              showController: true,
              speedOption: [1, 2, 4, 8],
              useVirtualDom: false,
              showWarning: false,
            },
          });

          if (cancelled) {
            (player as any).$destroy?.();
            return;
          }

          playerRef.current = player;
        } catch {
          playerRoot.replaceChildren();

          if (!cancelled) {
            setPlayerError(true);
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPlayerError(true);
        }
      });

    return () => {
      cancelled = true;

      if (playerRef.current) {
        destroyReplayPlayer(playerRef.current);
        playerRef.current = null;
      }

      playerRoot.replaceChildren();
    };
  }, [canReplay, replayEvents, playerWidth, playerHeight]);

  return (
    <Column alignItems="center" width="100%">
      <div ref={playerWrapperRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: playerWidth,
            maxWidth: '100%',
            height: showUnavailable ? playerHeight : playerOuterHeight,
            overflow: 'hidden',
            borderRadius: '8px',
            border: '1px solid var(--base300)',
            background: 'var(--base75)',
          }}
        >
          <div
            ref={playerRootRef}
            style={{
              display: showUnavailable ? 'none' : 'block',
              width: playerWidth,
              height: playerOuterHeight,
            }}
          />
          {showUnavailable && <Empty message="Replay unavailable." />}
        </div>
      </div>
    </Column>
  );
}
