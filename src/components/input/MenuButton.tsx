import { ReactNode, Key } from 'react';
import { DialogTrigger, Button, Menu, Popover, Icon } from '@umami/react-zen';
import { Lucide } from '@/components/icons';

export function MenuButton({
  children,
  onAction,
}: {
  children: ReactNode;
  onAction?: (action: string) => void;
}) {
  const handleAction = (key: Key) => {
    onAction?.(key.toString());
  };

  return (
    <DialogTrigger>
      <Button variant="outline">
        <Icon>
          <Lucide.Ellipsis />
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
