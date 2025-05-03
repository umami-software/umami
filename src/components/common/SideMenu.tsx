import { Text, List, ListItem } from '@umami/react-zen';

export interface MenuNavProps {
  items: { id: string; label: string; url: string }[];
  selectedKey?: string;
}

export function SideMenu({ items, selectedKey }: MenuNavProps) {
  return (
    <List>
      {items.map(({ id, label, url }) => {
        return (
          <ListItem key={id} id={id} href={url}>
            <Text weight={id === selectedKey ? 'bold' : 'regular'}>{label}</Text>
          </ListItem>
        );
      })}
    </List>
  );
}
