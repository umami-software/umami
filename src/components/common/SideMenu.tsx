import { ReactNode } from 'react';
import { Text, List, ListItem, Icon, Row } from '@umami/react-zen';

export interface SideMenuProps {
  items: { id: string; label: string; url: string; icon?: ReactNode }[];
  selectedKey?: string;
}

export function SideMenu({ items, selectedKey }: SideMenuProps) {
  return (
    <List>
      {items.map(({ id, label, url, icon }) => {
        return (
          <ListItem key={id} id={id} href={url}>
            <Row alignItems="center" gap>
              {icon && <Icon>{icon}</Icon>}
              <Text weight={id === selectedKey ? 'bold' : 'regular'}>{label}</Text>
            </Row>
          </ListItem>
        );
      })}
    </List>
  );
}
