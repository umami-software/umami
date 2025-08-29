import { ReactNode } from 'react';
import { Button, Icon, Modal, Text, DialogTrigger } from '@umami/react-zen';

export function ActionButton({
  onClick,
  icon,
  title,
  children,
}: {
  onClick?: () => void;
  icon?: ReactNode;
  title?: string;
  children?: ReactNode;
}) {
  return (
    <DialogTrigger>
      <Text title={title}>
        <Button variant="quiet" onPress={onClick}>
          <Icon>{icon}</Icon>
        </Button>
      </Text>
      <Modal>{children}</Modal>
    </DialogTrigger>
  );
}
