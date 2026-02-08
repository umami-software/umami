import { Column, Focusable, Row, Text, Tooltip, TooltipTrigger } from '@umami/react-zen';
import Link from 'next/link';
import { IconLabel } from '@/components/common/IconLabel';
import { useMessages, useNavigation } from '@/components/hooks';
import { ArrowLeft, Settings2, UserCircle, Users } from '@/components/icons';

export function SettingsNav({
  isCollapsed,
  onItemClick,
}: {
  isCollapsed?: boolean;
  onItemClick?: () => void;
}) {
  const { t, labels } = useMessages();
  const { renderUrl, pathname } = useNavigation();

  const items = [
    {
      label: t(labels.application),
      items: [
        {
          id: 'preferences',
          label: t(labels.preferences),
          path: renderUrl('/settings/preferences'),
          icon: <Settings2 />,
        },
      ],
    },
    {
      label: t(labels.account),
      items: [
        {
          id: 'profile',
          label: t(labels.profile),
          path: renderUrl('/settings/profile'),
          icon: <UserCircle />,
        },
        {
          id: 'teams',
          label: t(labels.teams),
          path: renderUrl('/settings/teams'),
          icon: <Users />,
        },
      ],
    },
  ];

  const selectedKey = items
    .flatMap(e => e.items)
    .find(({ path }) => path && pathname.includes(path.split('?')[0]))?.id;

  return (
    <Column gap="2">
      <Link href={renderUrl('/boards', false)} role="button" onClick={onItemClick}>
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
