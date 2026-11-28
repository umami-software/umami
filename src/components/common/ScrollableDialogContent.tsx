import { DialogContent } from '@umami/react-zen';
import type { ComponentProps, CSSProperties } from 'react';
import { OverlayScrollArea } from './OverlayScrollArea';
import styles from './ScrollableDialogContent.module.css';

export type ScrollableDialogContentProps = Omit<ComponentProps<typeof DialogContent>, 'style'> & {
  style?: CSSProperties;
};

/**
 * A `DialogContent` whose body scrolls in an `OverlayScrollArea` instead of with a native
 * scrollbar. The dialog keeps its size props; its padding moves onto the scrolling body so the
 * scrollbar sits flush against the dialog edge.
 */
export function ScrollableDialogContent({
  style,
  children,
  ...props
}: ScrollableDialogContentProps) {
  const {
    padding = 'calc(var(--spacing) * 6)',
    overflow: _overflow,
    overflowX: _overflowX,
    overflowY: _overflowY,
    ...dialogStyle
  } = style ?? {};

  return (
    <DialogContent
      {...props}
      style={{
        ...dialogStyle,
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <OverlayScrollArea className={styles.scroll}>
        <div className={styles.body} style={{ padding }}>
          {children}
        </div>
      </OverlayScrollArea>
    </DialogContent>
  );
}
