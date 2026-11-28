import { Button, Icon, Sheet, SheetContent, SheetTrigger } from '@umami/react-zen';
import { type ComponentProps, type CSSProperties, type ReactNode, useState } from 'react';
import { OverlayScrollArea } from '@/components/common/OverlayScrollArea';
import { Menu } from '@/components/icons';

export interface MobileMenuRenderProps {
  close: () => void;
}

export interface MobileMenuButtonProps
  extends Omit<ComponentProps<typeof SheetContent>, 'children' | 'side' | 'style'> {
  style?: CSSProperties;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode | ((props: MobileMenuRenderProps) => ReactNode);
}

export function MobileMenuButton({
  children,
  open: controlledOpen,
  onOpenChange,
  style,
  ...props
}: MobileMenuButtonProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = controlledOpen ?? uncontrolledOpen;
  const handleOpenChange = (open: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(open);
    }
    onOpenChange?.(open);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger render={<Button variant="outline" />}>
        <Icon>
          <Menu />
        </Icon>
      </SheetTrigger>
      <SheetContent
        {...props}
        side="left"
        style={{ width: '24rem', maxWidth: '100dvw', padding: 0, overflow: 'hidden', ...style }}
      >
        <OverlayScrollArea style={{ flex: '1 1 auto', minHeight: 0 }}>
          {/* Matches SheetContent's own flex column and gap. */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'calc(var(--spacing) * 4)',
              padding: 24,
            }}
          >
            {typeof children === 'function'
              ? children({ close: () => handleOpenChange(false) })
              : children}
          </div>
        </OverlayScrollArea>
      </SheetContent>
    </Sheet>
  );
}
