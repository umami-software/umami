import { Column, Row, Text, Tooltip, TooltipTrigger } from '@umami/react-zen';
import { IconLabel } from '@/components/common/IconLabel';
import Link from '@/components/common/Link';
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
    <Column gap="2" marginTop={isCollapsed ? '2' : undefined}>
      <Link href={renderUrl('/websites', false)} role="button" onClick={onItemClick}>
        {isCollapsed ? (
          <TooltipTrigger delay={0}>
            <Row
              tabIndex={0}
              alignItems="center"
              justifyContent="center"
              hover={{ backgroundColor: 'surface-sunken' }}
              borderRadius
              minHeight="9"
            >
              <IconLabel icon={<ArrowLeft />} label="" padding />
            </Row>
            <Tooltip placement="right">{t(labels.back)}</Tooltip>
          </TooltipTrigger>
        ) : (
          <Row
            alignItems="center"
            hover={{ backgroundColor: 'surface-sunken' }}
            borderRadius
            minHeight="9"
          >
            <IconLabel icon={<ArrowLeft />} label={t(labels.back)} padding />
          </Row>
        )}
      </Link>
      {items.map(({ label: sectionLabel, items: sectionItems }, index) => (
        <Column key={`${sectionLabel}${index}`} gap="1" marginBottom="1">
          {!isCollapsed && (
            <Row paddingX="3" marginTop="2">
              <Text weight="bold">{sectionLabel}</Text>
            </Row>
          )}
          {sectionItems.map(({ id, path, label, icon }) => {
            const isSelected = selectedKey === id;
            return (
              <Link key={id} href={path} role="button" onClick={onItemClick}>
                {isCollapsed ? (
                  <TooltipTrigger delay={0}>
                    <Row
                      tabIndex={0}
                      alignItems="center"
                      justifyContent="center"
                      hover={{ backgroundColor: 'surface-sunken' }}
                      backgroundColor={isSelected ? 'surface-sunken' : undefined}
                      borderRadius
                      minHeight="9"
                    >
                      <IconLabel
                        icon={icon}
                        label=""
                        weight={isSelected ? 'bold' : undefined}
                        padding
                      />
                    </Row>
                    <Tooltip placement="right">{label}</Tooltip>
                  </TooltipTrigger>
                ) : (
                  <Row
                    alignItems="center"
                    hover={{ backgroundColor: 'surface-sunken' }}
                    backgroundColor={isSelected ? 'surface-sunken' : undefined}
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
                )}
              </Link>
            );
          })}
        </Column>
      ))}
    </Column>
  );
}
