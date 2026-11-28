import { DropdownMenuContent } from '@umami/react-zen';
import type { ComponentProps, CSSProperties } from 'react';
import { OverlayScrollArea } from './OverlayScrollArea';

export type ScrollableDropdownMenuContentProps = Omit<
  ComponentProps<typeof DropdownMenuContent>,
  'style'
> & {
  style?: CSSProperties;
};

/**
 * A `DropdownMenuContent` whose items scroll in an `OverlayScrollArea` instead of with a native
 * scrollbar. Size the menu with `style.maxHeight`; its padding moves onto the scrolling body.
 */
export function ScrollableDropdownMenuContent({
  style,
  children,
  ...props
}: ScrollableDropdownMenuContentProps) {
  const {
    padding = 'calc(var(--spacing) * 1)',
    overflow: _overflow,
    overflowX: _overflowX,
    overflowY: _overflowY,
    ...menuStyle
  } = style ?? {};

  return (
    <DropdownMenuContent
      {...props}
      style={{
        ...menuStyle,
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <OverlayScrollArea style={{ flex: '1 1 auto', minHeight: 0 }}>
        <div style={{ padding }}>{children}</div>
      </OverlayScrollArea>
    </DropdownMenuContent>
  );
}
