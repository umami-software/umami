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
          {Children.map(children, child => {
            if (!isValidElement(child)) {
              return child;
            }

            const menuChild = child as ReactElement<{ onAction?: (key: Key) => void }>;

            return cloneElement(menuChild, {
              onAction: (key: Key) => {
                menuChild.props.onAction?.(key);
                handleAction(key);
              },
            });
          })}
        </Menu>
      </Popover>
    </DialogTrigger>
  );
}
