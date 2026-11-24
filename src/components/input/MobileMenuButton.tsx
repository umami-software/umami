import { Button, Icon, Sheet, SheetContent, SheetTrigger } from '@umami/react-zen';
import { type ComponentProps, type CSSProperties, type ReactNode, useState } from 'react';
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
      <SheetTrigger render={<Button variant="secondary" />}>
        <Icon>
          <Menu />
        </Icon>
      </SheetTrigger>
      <SheetContent
        {...props}
        side="left"
        style={{ width: '24rem', maxWidth: '100dvw', padding: 24, overflow: 'auto', ...style }}
      >
        {typeof children === 'function'
          ? children({ close: () => handleOpenChange(false) })
          : children}
      </SheetContent>
    </Sheet>
  );
}
