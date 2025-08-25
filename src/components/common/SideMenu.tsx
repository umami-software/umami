import { ReactNode } from 'react';
import {
  Text,
  Heading,
  NavMenu,
  NavMenuItem,
  Icon,
  Row,
  Column,
  NavMenuGroup,
  NavMenuProps,
} from '@umami/react-zen';
import Link from 'next/link';

export interface SideMenuProps extends NavMenuProps {
  items: { label: string; items: { id: string; label: string; icon?: any; path: string }[] }[];
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
      <NavMenu muteItems={false} gap="6" {...props}>
        {items?.map(({ label, items }, index) => {
          return (
            <NavMenuGroup
              title={label}
              key={`${label}${index}`}
              gap="1"
              allowMinimize={allowMinimize}
              marginBottom="3"
            >
              {items?.map(({ id, label, icon, path }) => {
                const isSelected = selectedKey === id;

                return (
                  <Link key={id} href={path}>
                    <NavMenuItem isSelected={isSelected}>
                      <Row alignItems="center" gap>
                        <Icon>{icon}</Icon>
                        <Text>{label}</Text>
                      </Row>
                    </NavMenuItem>
                  </Link>
                );
              })}
            </NavMenuGroup>
          );
        })}
      </NavMenu>
    </Column>
  );
}
