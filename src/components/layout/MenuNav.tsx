import { Column, Button, Text, List, ListItem } from '@umami/react-zen';
import Link from 'next/link';

export interface MenuNavProps {
  items: any[];
  selectedKey?: string;
}

export function MenuNav({ items, selectedKey }: MenuNavProps) {
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

export function MenuNav2({ items, selectedKey }: MenuNavProps) {
  return (
    <Column gap="3" alignItems="flex-start" justifyContent="stretch">
      {items.map(({ key, label, url }) => {
        return (
          <Button key={key} style={{ width: '100%' }} asChild>
            <Link href={url}>
              <Text weight={key === selectedKey ? 'bold' : 'regular'}>{label}</Text>
            </Link>
          </Button>
        );
      })}
    </Column>
  );
}
