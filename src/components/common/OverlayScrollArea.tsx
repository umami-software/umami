import { cn, type ScrollAreaProps, ScrollArea as ZenScrollArea } from '@umami/react-zen';
import { type RefObject, useEffect, useRef, useState } from 'react';
import { useMessages } from '@/components/hooks';
import { ChevronDown, ChevronUp } from '@/components/icons';
import styles from './OverlayScrollArea.module.css';

// Pixels of slack before an edge counts as reached, to absorb sub-pixel scroll positions.
const EDGE_THRESHOLD = 1;

// Fraction of the visible height scrolled when an indicator is clicked.
const SCROLL_STEP = 0.75;

export interface OverlayScrollAreaProps extends ScrollAreaProps {
  /** Show a gradient and chevron at an edge while there is more content to scroll to. */
  showScrollIndicators?: boolean;
}

export function OverlayScrollArea({
  className,
  style,
  showScrollIndicators,
  ...props
}: OverlayScrollAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (!showScrollIndicators) {
    return <ZenScrollArea className={cn(styles.root, className)} style={style} {...props} />;
  }

  return (
    <div ref={containerRef} className={styles.container} style={style}>
      <ZenScrollArea className={cn(styles.root, className)} {...props} />
      <ScrollIndicators containerRef={containerRef} />
    </div>
  );
}

function ScrollIndicators({ containerRef }: { containerRef: RefObject<HTMLDivElement | null> }) {
  const { t, labels } = useMessages();
  const viewportRef = useRef<HTMLElement | null>(null);
  const [overflow, setOverflow] = useState({ up: false, down: false });

  useEffect(() => {
    const viewport = containerRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    );

    if (!viewport) return;

    viewportRef.current = viewport;

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const up = scrollTop > EDGE_THRESHOLD;
      const down = scrollTop + clientHeight < scrollHeight - EDGE_THRESHOLD;

      setOverflow(prev => (prev.up === up && prev.down === down ? prev : { up, down }));
    };

    update();

    viewport.addEventListener('scroll', update, { passive: true });

    // Re-measure when the sidebar resizes or its content changes (navigation, collapsing).
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    if (viewport.firstElementChild) observer.observe(viewport.firstElementChild);

    return () => {
      viewport.removeEventListener('scroll', update);
      observer.disconnect();
      viewportRef.current = null;
    };
  }, [containerRef]);

  const scroll = (direction: 1 | -1) => {
    const viewport = viewportRef.current;

    if (!viewport) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    viewport.scrollBy({
      top: direction * viewport.clientHeight * SCROLL_STEP,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <>
      <div className={cn(styles.indicator, styles.top)} data-visible={overflow.up || undefined}>
        <button
          type="button"
          className={styles.indicatorButton}
          aria-label={t(labels.scrollUp)}
          onClick={() => scroll(-1)}
        >
          <ChevronUp size={16} />
        </button>
      </div>
      <div
        className={cn(styles.indicator, styles.bottom)}
        data-visible={overflow.down || undefined}
      >
        <button
          type="button"
          className={styles.indicatorButton}
          aria-label={t(labels.scrollDown)}
          onClick={() => scroll(1)}
        >
          <ChevronDown size={16} />
        </button>
      </div>
    </>
  );
}
