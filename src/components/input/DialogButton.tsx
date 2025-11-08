import { CSSProperties, ReactNode } from 'react';
import {
  Button,
  ButtonProps,
  Modal,
  Dialog,
  DialogTrigger,
  DialogProps,
  IconLabel,
} from '@umami/react-zen';
import { useMobile } from '@/components/hooks';

export interface DialogButtonProps extends Omit<ButtonProps, 'children'> {
  icon?: ReactNode;
  label?: ReactNode;
  title?: ReactNode;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
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
    padding: '32px',
  };

  if (isMobile) {
    style.width = '100%';
    style.height = '100%';
    style.maxHeight = '100%';
    style.overflowY = 'auto';
  }

  return (
    <DialogTrigger>
      <Button {...props}>
        <IconLabel icon={icon} label={label} />
      </Button>
      <Modal placement={isMobile ? 'fullscreen' : 'center'}>
        <Dialog variant={isMobile ? 'sheet' : undefined} title={title || label} style={style}>
          {children}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
