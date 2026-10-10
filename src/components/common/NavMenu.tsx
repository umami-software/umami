import { Column, Heading, Row, Text } from '@umami/react-zen';
import { IconLabel } from '@/components/common/IconLabel';
import Link from '@/components/common/Link';

interface NavMenuData {
  id: string;
  label: string;
  icon?: any;
  path: string;
}

interface NavMenuItems {
  label?: string;
  items: NavMenuData[];
}

export interface NavMenuProps {
  items: NavMenuItems[];
  title?: string;
  selectedKey?: string;
  allowMinimize?: boolean;
  onItemClick?: () => void;
}

export function NavMenu({
  items = [],
  title,
  selectedKey,
  allowMinimize,
  onItemClick,
  ...props
}: NavMenuProps) {
  const renderItems = (items: NavMenuData[]) => {
    return items?.map(({ id, label, icon, path }) => {
      const isSelected = selectedKey === id;

      return (
        <Link key={id} href={path} onClick={onItemClick}>
          <Row
            padding
            borderRadius
            hover={{ backgroundColor: 'surface-sunken' }}
            backgroundColor={isSelected ? 'surface-sunken' : undefined}
          >
            <IconLabel icon={icon}>
              <Text weight={isSelected ? 'bold' : 'normal'}>{label}</Text>
            </IconLabel>
          </Row>
        </Link>
      );
    });
  };

  return (
    <Column gap justifyContent="space-between" position="sticky">
      {title && (
        <Row padding>
          <Heading size="lg">{title}</Heading>
        </Row>
      )}
      <Column gap="3" {...props}>
        {items?.map(({ label, items }, index) => {
          if (label) {
            return (
              <Column key={`${label}${index}`} gap="1" minHeight="40px">
                <Row paddingX="3" marginTop="2">
                  <Text weight="bold">{label}</Text>
                </Row>
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
