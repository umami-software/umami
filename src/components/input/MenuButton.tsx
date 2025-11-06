import { ReactNode, Key } from 'react';
import { DialogTrigger, Button, Menu, Popover, Icon } from '@umami/react-zen';
import { Ellipsis } from '@/components/icons';

export function MenuButton({
  children,
  onAction,
  isDisabled,
}: {
  children: ReactNode;
  onAction?: (action: string) => void;
  isDisabled?: boolean;
}) {
  const handleAction = (key: Key) => {
    onAction?.(key.toString());
  };

  return (
    <DialogTrigger>
      <Button variant="quiet" isDisabled={isDisabled}>
        <Icon>
          <Ellipsis />
        </Icon>
      </Button>
      <Popover placement="bottom start">
        <Menu aria-label="menu" onAction={handleAction} style={{ minWidth: '140px' }}>
          {children}
        </Menu>
      </Popover>
    </DialogTrigger>
  );
}
