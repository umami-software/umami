import { Column, Row, Text } from '@umami/react-zen';
import type { ReactNode } from 'react';
import { IconLabel } from '@/components/common/IconLabel';
import Link from '@/components/common/Link';
import {
  useMessages,
  useMetricsNavItems,
  useNavigation,
  useWebsiteNavItems,
} from '@/components/hooks';
import { ArrowLeft } from '@/components/icons';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

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
