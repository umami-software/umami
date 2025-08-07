import { ReactNode } from 'react';
import { Button, Icon, Modal, DialogTrigger, TooltipTrigger, Tooltip } from '@umami/react-zen';

export function ActionButton({
  onClick,
  icon,
  tooltip,
  children,
}: {
  onSave?: () => void;
  icon?: ReactNode;
  tooltip?: string;
  children?: React.ReactNode;
}) {
  return (
    <DialogTrigger>
      <TooltipTrigger delay={0}>
        <Button variant="quiet" onPress={onClick}>
          <Icon>{icon}</Icon>
        </Button>
        <Tooltip>{tooltip}</Tooltip>
      </TooltipTrigger>
      <Modal>{children}</Modal>
    </DialogTrigger>
  );
}
