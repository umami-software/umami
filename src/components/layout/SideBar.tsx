import { Text, List, ListItem } from '@umami/react-zen';

export interface MenuNavProps {
  items: any[];
  selectedKey?: string;
}

export function SideBar({ items, selectedKey }: MenuNavProps) {
  return (
    <List>
      {items.map(({ key, label, url }) => {
        return (
          <ListItem key={key} href={url}>
            <Text weight={key === selectedKey ? 'bold' : 'regular'}>{label}</Text>
          </ListItem>
        );
      })}
    </List>
  );
}
