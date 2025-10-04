import { ReactNode } from 'react';
import {
  Heading,
  NavMenu,
  NavMenuItem,
  Row,
  Column,
  NavMenuGroup,
  NavMenuProps,
  IconLabel,
} from '@umami/react-zen';
import Link from 'next/link';

interface SideMenuData {
  id: string;
  label: string;
  icon?: any;
  path: string;
}

interface SideMenuItems {
  label?: string;
  items: SideMenuData[];
}

export interface SideMenuProps extends NavMenuProps {
  items: SideMenuItems[];
  title?: string;
  selectedKey?: string;
  allowMinimize?: boolean;
  children?: ReactNode;
}

export function SideMenu({
  items = [],
  title,
  selectedKey,
  allowMinimize,
  children,
  ...props
}: SideMenuProps) {
  const renderItems = (items: SideMenuData[]) => {
    return items?.map(({ id, label, icon, path }) => {
      const isSelected = selectedKey === id;

      return (
        <Link key={id} href={path}>
          <NavMenuItem isSelected={isSelected}>
            <IconLabel icon={icon}>{label}</IconLabel>
          </NavMenuItem>
        </Link>
      );
    });
  };

  return (
    <Column
      gap
      padding
      width="240px"
      overflowY="auto"
      justifyContent="space-between"
      position="sticky"
      top="0"
      backgroundColor
    >
      {children}
      {title && (
        <Row padding>
          <Heading size="1">{title}</Heading>
        </Row>
      )}
      <NavMenu gap="6" {...props}>
        {items?.map(({ label, items }, index) => {
          if (label) {
            return (
              <NavMenuGroup
                title={label}
                key={`${label}${index}`}
                gap="1"
                allowMinimize={allowMinimize}
                marginBottom="3"
              >
                {renderItems(items)}
              </NavMenuGroup>
            );
          }
        })}
      </NavMenu>
    </Column>
  );
}
