import { Column, Row, Text } from '@umami/react-zen';
import { IconLabel } from '@/components/common/IconLabel';
import Link from '@/components/common/Link';
import { useMessages, useNavigation, useWebsiteNavItems } from '@/components/hooks';
import { ArrowLeft } from '@/components/icons';

export function WebsiteNav({
  websiteId,
  onItemClick,
}: {
  websiteId: string;
  onItemClick?: () => void;
}) {
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();
  const { items, selectedKey } = useWebsiteNavItems(websiteId);

  return (
    <Column gap="2">
      <Link href={renderUrl('/websites', false)} role="button" onClick={onItemClick}>
        <Row alignItems="center" hover={{ backgroundColor: 'muted' }} borderRadius minHeight="9">
          <IconLabel icon={<ArrowLeft />} label={t(labels.back)} padding />
        </Row>
      </Link>
      {items.map(({ label: sectionLabel, items: sectionItems }, index) => (
        <Column key={`${sectionLabel}${index}`} gap="1" marginBottom="1">
          <Row paddingX="3" marginTop="2">
            <Text weight="bold">{sectionLabel}</Text>
          </Row>
          {sectionItems.map(({ id, path, label, icon }) => {
            const isSelected = selectedKey === id;
            return (
              <Link key={id} href={path} role="button" onClick={onItemClick}>
                <Row
                  alignItems="center"
                  hover={{ backgroundColor: 'muted' }}
                  backgroundColor={isSelected ? 'muted' : undefined}
                  borderRadius
                  minHeight="9"
                >
                  <IconLabel
                    icon={icon}
                    label={label}
                    weight={isSelected ? 'bold' : undefined}
                    padding
                  />
                </Row>
              </Link>
            );
          })}
        </Column>
      ))}
    </Column>
  );
}
