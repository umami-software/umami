import {
  Box,
  Column,
  type ColumnProps,
  Focusable,
  Icon,
  Row,
  type RowProps,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@umami/react-zen';
import classNames from 'classnames';
import { createContext, type ReactNode, useContext } from 'react';

export interface SidebarProps extends ColumnProps {
  isCollapsed?: boolean;
  muteItems?: boolean;
  children?: ReactNode;
}

const SidebarContext = createContext(null as any);

export function Sidebar({ isCollapsed, muteItems, className, children, ...props }: SidebarProps) {
  return (
    <SidebarContext.Provider value={{ isCollapsed }}>
      <Column
        {...props}
        border="right"
        width={isCollapsed ? '64px' : '240px'}
        backgroundColor="surface-base"
      >
        {children}
      </Column>
    </SidebarContext.Provider>
  );
}

export function SidebarSection({
  title,
  className,
  children,
  ...props
}: { title?: string; children: ReactNode } & ColumnProps) {
  return (
    <Column {...props} paddingY="2" className={className}>
      {title && (
        <Box paddingX="4" paddingY="2">
          <Text size="xs" weight="semibold" transform="uppercase" color="muted">
            {title}
          </Text>
        </Box>
      )}
      <Column>{children}</Column>
    </Column>
  );
}

export function SidebarHeader({
  label,
  icon,
  className,
  children,
  ...props
}: {
  label: string;
  icon?: ReactNode;
  children?: ReactNode;
} & RowProps) {
  return (
    <Row {...props} paddingX="4" paddingY="3" gap="3" alignItems="center" className={className}>
      {icon && <Icon size="sm">{icon}</Icon>}
      {label && <Text weight="semibold">{label}</Text>}
      {children}
    </Row>
  );
}

export interface SidebarItemProps extends RowProps {
  isSelected?: boolean;
}

export function SidebarItem({
  label,
  icon,
  isSelected,
  className,
  children,
  ...props
}: {
  label?: string;
  icon?: ReactNode;
} & SidebarItemProps) {
  const { isCollapsed } = useContext(SidebarContext);

  return (
    <TooltipTrigger delay={0} closeDelay={0} isDisabled={!isCollapsed}>
      <Focusable>
        <Row
          {...props}
          paddingX={isCollapsed ? '0' : '4'}
          paddingY="2"
          gap="3"
          alignItems="center"
          justifyContent={isCollapsed ? 'center' : undefined}
          borderRadius="md"
          className={classNames(
            'cursor-pointer',
            'hover:bg-interactive',
            isSelected && 'bg-interactive font-medium',
            className,
          )}
        >
          {icon && <Icon size="sm">{icon}</Icon>}
          {label && !isCollapsed && <Text>{label}</Text>}
          {children}
        </Row>
      </Focusable>
      <Tooltip placement="right">{label}</Tooltip>
    </TooltipTrigger>
  );
}
