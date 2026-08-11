import { Button, DialogTrigger, Icon, Menu, Popover } from '@umami/react-zen';
import {
  Children,
  cloneElement,
  isValidElement,
  type Key,
  type ReactElement,
  type ReactNode,
} from 'react';
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
      <Popover side="bottom" align="start">
        <Menu aria-label="menu" style={{ minWidth: '140px' }}>
          {Children.map(children, child =>
            isValidElement(child)
              ? cloneElement(child as ReactElement<{ onAction?: (key: Key) => void }>, {
                  onAction: handleAction,
                })
              : child,
          )}
        </Menu>
      </Popover>
    </DialogTrigger>
  );
}
