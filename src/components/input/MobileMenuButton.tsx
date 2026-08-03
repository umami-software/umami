import {
  Button,
  type DialogRenderProps,
  DialogTrigger,
  Icon,
  Sheet,
  type SheetProps,
} from '@umami/react-zen';
import { type ReactNode, useState } from 'react';
import { Menu } from '@/components/icons';

export interface MobileMenuButtonProps extends Omit<SheetProps, 'children' | 'side'> {
  children?: ReactNode | ((props: DialogRenderProps) => ReactNode);
}

export function MobileMenuButton({
  children,
  isOpen: controlledOpen,
  onOpenChange,
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
    <DialogTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Button>
        <Icon>
          <Menu />
        </Icon>
      </Button>
      <Sheet {...props} side="left">
        {typeof children === 'function'
          ? children({ close: () => handleOpenChange(false) })
          : children}
      </Sheet>
    </DialogTrigger>
  );
}
