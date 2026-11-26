import { Column, Icon, Row, Text } from '@umami/react-zen';
import { IconLabel } from '@/components/common/IconLabel';
import Link from '@/components/common/Link';
import {
  type NavItem,
  type NavSection,
  useMessages,
  useMetricsNavItems,
  useNavGroupOpen,
  useNavigation,
  useWebsiteNavItems,
} from '@/components/hooks';
import { ArrowLeft, ChevronRight } from '@/components/icons';

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
          {sectionItems.map(item =>
            item.children?.length > 0 ? (
              <SectionNavGroup
                key={item.id}
                item={item}
                selectedKey={selectedKey}
                onItemClick={onItemClick}
              />
            ) : (
              <SectionNavLink
                key={item.id}
                item={item}
                selectedKey={selectedKey}
                onItemClick={onItemClick}
              />
            ),
          )}
        </Column>
      ))}
    </Column>
  );
}

/** A nav item whose sub-items expand and collapse beneath it. */
export function SectionNavGroup({
  item,
  selectedKey,
  onItemClick,
  minHeight = '9',
}: {
  item: NavItem;
  selectedKey?: string;
  onItemClick?: () => void;
  minHeight?: string;
}) {
  const { open, setOpen } = useNavGroupOpen(item, selectedKey);
  const toggle = () => setOpen(!open);

  return (
    <Column gap="1">
      <Row
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={toggle}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        alignItems="center"
        justifyContent="space-between"
        hover={{ backgroundColor: 'muted' }}
        borderRadius
        minHeight={minHeight}
        paddingRight="3"
        style={{ cursor: 'pointer' }}
      >
        <IconLabel icon={item.icon} label={item.label} padding />
        <Icon size="sm" color="muted" rotate={open ? 90 : 0}>
          <ChevronRight />
        </Icon>
      </Row>
      {open && (
        <Column gap="1" marginLeft="6" paddingLeft="2" border="left">
          {item.children.map(child => (
            <SectionNavLink
              key={child.id}
              item={child}
              selectedKey={selectedKey}
              onItemClick={onItemClick}
              minHeight={minHeight}
            />
          ))}
        </Column>
      )}
    </Column>
  );
}

function SectionNavLink({
  item: { id, path, label, icon },
  selectedKey,
  onItemClick,
  minHeight = '9',
}: {
  item: NavItem;
  selectedKey?: string;
  onItemClick?: () => void;
  minHeight?: string;
}) {
  const isSelected = selectedKey === id;

  return (
    <Link href={path} role="button" onClick={onItemClick}>
      <Row
        alignItems="center"
        hover={{ backgroundColor: 'muted' }}
        backgroundColor={isSelected ? 'muted' : undefined}
        borderRadius
        minHeight={minHeight}
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
