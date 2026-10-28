'use client';
import { Column, Text, useTheme } from '@umami/react-zen';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { BoardViewPage } from '@/app/(main)/boards/[boardId]/BoardViewPage';
import { useShare } from '@/components/hooks';
import { ENTITY_TYPE } from '@/lib/constants';
import { getShareTheme } from '@/lib/share';

/**
 * Chromeless public view of a board share, meant to be placed in an <iframe>.
 * Access is governed by the share itself: it must have `embed: true`, and the proxy only lets
 * the owner-approved origins frame this route (CSP frame-ancestors).
 */
export function EmbedPage() {
  const share = useShare();
  const search = useSearchParams();
  const { initTheme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const { parameters = {}, shareType, boardId, slug } = share || ({} as any);
  const allowed = parameters.embed === true && shareType === ENTITY_TYPE.board && !!boardId;
  const queryTheme = search.get('theme');
  const theme =
    queryTheme === 'light' || queryTheme === 'dark'
      ? queryTheme
      : (getShareTheme(parameters) ??
        (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'));

  useEffect(() => {
    initTheme(theme, 'system');
    document.documentElement.dataset.embed = 'true';
    return () => {
      delete document.documentElement.dataset.embed;
    };
  }, [theme, initTheme]);

  // Tell the host page how tall the content is (the height is the only thing sent).
  useEffect(() => {
    if (!allowed || !ref.current || window.parent === window) {
      return;
    }

    const el = ref.current;
    const post = () =>
      window.parent.postMessage(
        { type: 'umami-embed-height', slug, height: Math.ceil(el.getBoundingClientRect().height) },
        '*',
      );
    const observer = new ResizeObserver(post);
    observer.observe(el);
    post();

    return () => observer.disconnect();
  }, [allowed, slug]);

  if (!allowed) {
    return (
      <Column alignItems="center" justifyContent="center" padding="6">
        <Text color="muted">This widget is not available for embedding.</Text>
      </Column>
    );
  }

  return (
    <div ref={ref}>
      <BoardViewPage
        boardId={boardId}
        showActions={false}
        showControls={search.get('controls') === '1'}
        showEntityBadges={false}
      />
    </div>
  );
}
