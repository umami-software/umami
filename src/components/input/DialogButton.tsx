import {
  Button,
  type ButtonProps,
  Dialog,
  type DialogProps,
  DialogTrigger,
  Modal,
} from '@umami/react-zen';
import type { CSSProperties, ReactNode } from 'react';
import { IconLabel } from '@/components/common/IconLabel';
import { useMobile } from '@/components/hooks';

export interface DialogButtonProps extends Omit<ButtonProps, 'children'> {
  icon?: ReactNode;
  label?: ReactNode;
  title?: ReactNode;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  children?: DialogProps['children'];
}

export function DialogButton({
  icon,
  label,
  title,
  width,
  height,
  minWidth,
  minHeight,
  isOpen,
  onOpenChange,
  children,
  ...props
}: DialogButtonProps) {
  const { isMobile } = useMobile();
  const style: CSSProperties = {
    width,
    height,
    minWidth,
    minHeight,
    maxHeight: 'calc(100dvh - 40px)',
    overflowY: 'auto',
    padding: '32px',
  };

  if (isMobile) {
    style.width = '100%';
    style.height = '100%';
    style.minWidth = undefined;
    style.minHeight = undefined;
    style.maxHeight = '100%';
    style.overflowY = 'auto';
  }

  const dialog = (
    <Dialog
      variant={isMobile ? 'sheet' : undefined}
      title={title === undefined ? label : title}
      style={style}
    >
      {children}
    </Dialog>
  );

  if (isOpen !== undefined) {
    return (
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable placement={isMobile ? 'fullscreen' : 'center'}>
        {dialog}
      </Modal>
    );
  }

  return (
    <DialogTrigger>
      <Button {...props}>
        <IconLabel icon={icon} label={label} />
      </Button>
      <Modal placement={isMobile ? 'fullscreen' : 'center'}>
        {dialog}
      </Modal>
    </DialogTrigger>
  );
}
