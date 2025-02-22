import { List, ListItem, Text } from '@umami/react-zen';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export interface SideNavProps {
  items: any[];
  shallow?: boolean;
  scroll?: boolean;
}

export function MenuNav({ items, shallow = true, scroll = false }: SideNavProps) {
  const pathname = usePathname();

  return (
    <List>
      {items.map(({ key, label, url }) => {
        const isSelected = pathname.startsWith(url);

        return (
          <ListItem key={key}>
            <Link href={url} shallow={shallow} scroll={scroll}>
              <Text weight={isSelected ? 'bold' : 'regular'}>{label}</Text>
            </Link>
          </ListItem>
        );
      })}
    </List>
  );
}
