import {
  Box,
  Column,
  Focusable,
  Label,
  Row,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@umami/react-zen';
import Link from 'next/link';
import { IconLabel } from '@/components/common/IconLabel';
import { NavMenu } from '@/components/common/NavMenu';
import { useMessages, useNavigation, useWebsiteNavItems } from '@/components/hooks';
import { ArrowLeft } from '@/components/icons';
import { WebsiteSelect } from '@/components/input/WebsiteSelect';

export function WebsiteNav({
  websiteId,
  isCollapsed,
  onItemClick,
}: {
  websiteId: string;
  isCollapsed?: boolean;
  onItemClick?: () => void;
}) {
  const { formatMessage, labels } = useMessages();
  const { teamId, router, renderUrl } = useNavigation();
  const { items, selectedKey } = useWebsiteNavItems(websiteId);

  const handleChange = (value: string) => {
    router.push(renderUrl(`/websites/${value}`));
  };

  const renderValue = (value: any) => {
    return (
      <Text truncate style={{ maxWidth: 160, lineHeight: 1 }}>
        {value?.selectedItem?.name}
      </Text>
    );
  };

  if (isCollapsed !== undefined) {
    return (
      <Column gap="2">
        <Link href={renderUrl('/websites', false)} role="button">
          <TooltipTrigger isDisabled={!isCollapsed} delay={0}>
            <Focusable>
              <Row
                alignItems="center"
                hover={{ backgroundColor: 'surface-sunken' }}
                borderRadius
                minHeight="40px"
              >
                <IconLabel
                  icon={<ArrowLeft />}
                  label={isCollapsed ? '' : formatMessage(labels.back)}
                  padding
                />
              </Row>
            </Focusable>
            <Tooltip placement="right">{formatMessage(labels.back)}</Tooltip>
          </TooltipTrigger>
        </Link>
        {!isCollapsed && (
          <Box marginBottom="2">
            <WebsiteSelect
              websiteId={websiteId}
              teamId={teamId}
              onChange={handleChange}
              renderValue={renderValue}
              buttonProps={{ style: { outline: 'none' } }}
            />
          </Box>
        )}
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
                <Link key={id} href={path} role="button">
                  <TooltipTrigger isDisabled={!isCollapsed} delay={0}>
                    <Focusable>
                      <Row
                        alignItems="center"
                        hover={{ backgroundColor: 'surface-sunken' }}
                        backgroundColor={isSelected ? 'surface-sunken' : undefined}
                        borderRadius
                        minHeight="40px"
                      >
                        <IconLabel icon={icon} label={isCollapsed ? '' : label} padding />
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

  return (
    <Column padding="2" position="sticky" top="0" gap>
      <WebsiteSelect
        websiteId={websiteId}
        teamId={teamId}
        onChange={handleChange}
        renderValue={renderValue}
        buttonProps={{ style: { outline: 'none' } }}
      />
      <NavMenu
        items={items}
        selectedKey={selectedKey}
        allowMinimize={false}
        onItemClick={onItemClick}
      />
    </Column>
  );
}
