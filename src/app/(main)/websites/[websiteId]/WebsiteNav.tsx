import { Column, Row, Text } from '@umami/react-zen';
import { IconLabel } from '@/components/common/IconLabel';
import Link from '@/components/common/Link';
import {
  type NavItem,
  type NavSection,
  useMessages,
  useMetricsNavItems,
  useNavigation,
  useWebsiteNavItems,
} from '@/components/hooks';
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
    <SectionNav
      backItem={{
        id: 'back',
        label: t(labels.back),
        path: renderUrl('/websites', false),
        icon: <ArrowLeft />,
      }}
      sections={items}
      selectedKey={selectedKey}
      onItemClick={onItemClick}
    />
  );
}

/** The metrics page's metrics, with a way back to the overview. */
export function MetricsNav({ onItemClick }: { onItemClick?: () => void }) {
  const { items, selectedKey, backItem } = useMetricsNavItems();

  return (
    <SectionNav
      backItem={backItem}
      sections={items}
      selectedKey={selectedKey}
      onItemClick={onItemClick}
    />
  );
}

function SectionNav({
  backItem,
  sections,
  selectedKey,
  onItemClick,
}: {
  backItem: NavItem;
  sections: NavSection[];
  selectedKey?: string;
  onItemClick?: () => void;
}) {
  return (
    <Column gap="2">
      <Link href={backItem.path} role="button" onClick={onItemClick}>
        <Row alignItems="center" hover={{ backgroundColor: 'muted' }} borderRadius minHeight="9">
          <IconLabel icon={backItem.icon} label={backItem.label} padding />
        </Row>
      </Link>
      {sections.map(({ label: sectionLabel, items: sectionItems }, index) => (
        <Column key={`${sectionLabel}${index}`} gap="1" marginBottom="1">
          <Row paddingX="3" marginTop="2">
            <Text weight="bold">{sectionLabel}</Text>
          </Row>
          {sectionItems.map(item => (
            <Column key={item.id} gap="1">
              <SectionNavLink item={item} selectedKey={selectedKey} onItemClick={onItemClick} />
              {item.children?.length > 0 && (
                <Column gap="1" marginLeft="6" paddingLeft="2" border="left">
                  {item.children.map(child => (
                    <SectionNavLink
                      key={child.id}
                      item={child}
                      selectedKey={selectedKey}
                      onItemClick={onItemClick}
                    />
                  ))}
                </Column>
              )}
            </Column>
          ))}
        </Column>
      ))}
    </Column>
  );
}

function SectionNavLink({
  item: { id, path, label, icon },
  selectedKey,
  onItemClick,
}: {
  item: NavItem;
  selectedKey?: string;
  onItemClick?: () => void;
}) {
  const isSelected = selectedKey === id;

  return (
    <Link href={path} role="button" onClick={onItemClick}>
      <Row
        alignItems="center"
        hover={{ backgroundColor: 'muted' }}
        backgroundColor={isSelected ? 'muted' : undefined}
        borderRadius
        minHeight="9"
      >
        {icon ? (
          <IconLabel icon={icon} label={label} weight={isSelected ? 'bold' : undefined} padding />
        ) : (
          <Row padding>
            <Text weight={isSelected ? 'bold' : undefined}>{label}</Text>
          </Row>
        )}
      </Row>
    </Link>
  );
}
