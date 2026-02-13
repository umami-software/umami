import { Column, Focusable, Row, Text, Tooltip, TooltipTrigger } from '@umami/react-zen';
import Link from 'next/link';
import { IconLabel } from '@/components/common/IconLabel';
import { useMessages, useNavigation, useWebsiteNavItems } from '@/components/hooks';
import { ArrowLeft } from '@/components/icons';

export function WebsiteNav({
  websiteId,
  isCollapsed,
  onItemClick,
}: {
  websiteId: string;
  isCollapsed?: boolean;
  onItemClick?: () => void;
}) {
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();
  const { items, selectedKey } = useWebsiteNavItems(websiteId);

  return (
    <Column gap="2">
      <Link href={renderUrl('/websites', false)} role="button" onClick={onItemClick}>
        <TooltipTrigger isDisabled={!isCollapsed} delay={0}>
          <Focusable>
            <Row
              alignItems="center"
              hover={{ backgroundColor: 'surface-sunken' }}
              borderRadius
              minHeight="40px"
            >
              <IconLabel icon={<ArrowLeft />} label={isCollapsed ? '' : t(labels.back)} padding />
            </Row>
          </Focusable>
          <Tooltip placement="right">{t(labels.back)}</Tooltip>
        </TooltipTrigger>
      </Link>
      {items.map(({ label: sectionLabel, items: sectionItems }, index) => (
        <Column key={`${sectionLabel}${index}`} gap="1" marginBottom="1">
          {!isCollapsed && (
            <Row padding>
              <Text weight="bold">{sectionLabel}</Text>
            </Row>
          )}
          {sectionItems.map(({ id, path, label, icon }) => {
            const isSelected = selectedKey === id;
            return (
              <Link key={id} href={path} role="button" onClick={onItemClick}>
                <TooltipTrigger isDisabled={!isCollapsed} delay={0}>
                  <Focusable>
                    <Row
                      alignItems="center"
                      hover={{ backgroundColor: 'surface-sunken' }}
                      backgroundColor={isSelected ? 'surface-sunken' : undefined}
                      borderRadius
                      minHeight="40px"
                    >
                      <IconLabel
                        icon={icon}
                        label={isCollapsed ? '' : label}
                        weight={isSelected ? 'bold' : undefined}
                        padding
                      />
                    </Row>
                  </Focusable>
                  <Tooltip placement="right">{label}</Tooltip>
                </TooltipTrigger>
              </Link>
            );
          })}
        </Column>
      ))}
    </Column>
  );
}
