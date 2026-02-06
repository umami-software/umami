import { Column, Heading, Row, Text } from '@umami/react-zen';
import Link from 'next/link';
import { IconLabel } from '@/components/common/IconLabel';

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

export interface SideMenuProps {
  items: SideMenuItems[];
  title?: string;
  selectedKey?: string;
  allowMinimize?: boolean;
}

export function SideMenu({
  items = [],
  title,
  selectedKey,
  allowMinimize,
  ...props
}: SideMenuProps) {
  const renderItems = (items: SideMenuData[]) => {
    return items?.map(({ id, label, icon, path }) => {
      const isSelected = selectedKey === id;

      return (
        <Link key={id} href={path}>
          <Row padding borderRadius hover={{ backgroundColor: 'surface-raised' }}>
            <IconLabel icon={icon}>
              <Text weight={isSelected ? 'bold' : 'normal'}>{label}</Text>
            </IconLabel>
          </Row>
        </Link>
      );
    });
  };

  return (
    <Column
      gap
      overflowY="auto"
      justifyContent="space-between"
      position="sticky"
      backgroundColor="surface-base"
    >
      {title && (
        <Row padding>
          <Heading size="sm">{title}</Heading>
        </Row>
      )}
      <Column gap="6" {...props}>
        {items?.map(({ label, items }, index) => {
          if (label) {
            return (
              <Column
                title={label}
                key={`${label}${index}`}
                gap="1"
                marginBottom="3"
                minHeight="40px"
              >
                {renderItems(items)}
              </Column>
            );
          }
          return null;
        })}
      </Column>
    </Column>
  );
}
