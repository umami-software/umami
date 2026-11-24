import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@umami/react-zen';
import { type ComponentProps, type CSSProperties, type ReactNode, useState } from 'react';
import { IconLabel } from '@/components/common/IconLabel';
import { useMobile } from '@/components/hooks';

export interface DialogRenderProps {
  close: () => void;
}

export interface DialogButtonProps
  extends Omit<ComponentProps<typeof Button>, 'children' | 'title'> {
  icon?: ReactNode;
  label?: ReactNode;
  title?: ReactNode;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  dialogClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode | ((props: DialogRenderProps) => ReactNode);
}

export function DialogButton({
  icon,
  label,
  title,
  width,
  height,
  minWidth,
  minHeight,
  dialogClassName,
  open,
  onOpenChange,
  variant = 'secondary',
  children,
  ...props
}: DialogButtonProps) {
  const { isMobile } = useMobile();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const setOpen = (value: boolean) => {
    if (!isControlled) {
      setInternalOpen(value);
    }
    onOpenChange?.(value);
  };

  const close = () => setOpen(false);

  const style: CSSProperties = {
    width,
    height,
    minWidth,
    minHeight,
    maxWidth: 'calc(100% - 2rem)',
    maxHeight: 'min(80dvh, calc(100dvh - 40px))',
    overflowY: 'auto',
    padding: '32px',
  };

  if (isMobile) {
    style.width = '100%';
    style.height = '100%';
    style.minWidth = undefined;
    style.minHeight = undefined;
    style.maxWidth = '100%';
    style.maxHeight = '100%';
    style.borderRadius = 0;
  }

  const dialogTitle = title === undefined ? label : title;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger render={<Button {...props} variant={variant} />}>
          <IconLabel icon={icon} label={label} />
        </DialogTrigger>
      )}
      <DialogContent showCloseButton={false} className={dialogClassName} style={style}>
        {dialogTitle && (
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
        )}
        {typeof children === 'function' ? children({ close }) : children}
      </DialogContent>
    </Dialog>
  );
}
