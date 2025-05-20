import { ReactNode } from 'react';
import { Text, NavMenu, NavMenuItem, Icon, Row } from '@umami/react-zen';
import Link from 'next/link';

export interface SideMenuProps {
  items: { id: string; label: string; url: string; icon?: ReactNode }[];
  selectedKey?: string;
}

export function SideMenu({ items, selectedKey }: SideMenuProps) {
  return (
    <NavMenu highlightColor="3">
      {items.map(({ id, label, url, icon }) => {
        return (
          <Link key={id} href={url}>
            <NavMenuItem isSelected={id === selectedKey}>
              <Row alignItems="center" gap>
                {icon && <Icon>{icon}</Icon>}
                <Text>{label}</Text>
              </Row>
            </NavMenuItem>
          </Link>
        );
      })}
    </NavMenu>
  );
}
