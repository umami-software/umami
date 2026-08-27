import { Column, Row, Text, Tooltip, TooltipTrigger } from '@umami/react-zen';
import { IconLabel } from '@/components/common/IconLabel';
import Link from '@/components/common/Link';
import { useMessages, useNavigation } from '@/components/hooks';
import { ArrowLeft, Settings2, ShieldCheck, UserCircle, Users } from '@/components/icons';

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
        {
          id: 'security',
          label: t(labels.security),
          path: renderUrl('/settings/security'),
          icon: <ShieldCheck />,
        },
      ],
    },
  ];

  const selectedKey = items
    .flatMap(e => e.items)
    .find(({ path }) => path && pathname.includes(path.split('?')[0]))?.id;

  return (
    <Column gap="2">
      <Link href={renderUrl('/websites', false)} role="button" onClick={onItemClick}>
        {(() => {
          const content = (
            <Row
              tabIndex={0}
              alignItems="center"
              justifyContent={isCollapsed ? 'center' : undefined}
              hover={{ backgroundColor: 'surface-sunken' }}
              borderRadius
              minHeight="9"
            >
              <IconLabel icon={<ArrowLeft />} label={isCollapsed ? '' : t(labels.back)} padding />
            </Row>
          );

          return isCollapsed ? (
            <TooltipTrigger delay={0}>
              {content}
              <Tooltip placement="right">{t(labels.back)}</Tooltip>
            </TooltipTrigger>
          ) : (
            content
          );
        })()}
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
            const content = (
              <Row
                tabIndex={0}
                alignItems="center"
                justifyContent={isCollapsed ? 'center' : undefined}
                hover={{ backgroundColor: 'surface-sunken' }}
                backgroundColor={isSelected ? 'surface-sunken' : undefined}
                borderRadius
                minHeight="9"
              >
                <IconLabel
                  icon={icon}
                  label={isCollapsed ? '' : label}
                  weight={isSelected ? 'bold' : undefined}
                  padding
                />
              </Row>
            );
            return (
              <Link key={id} href={path} role="button" onClick={onItemClick}>
                {isCollapsed ? (
                  <TooltipTrigger delay={0}>
                    {content}
                    <Tooltip placement="right">{label}</Tooltip>
                  </TooltipTrigger>
                ) : (
                  content
                )}
              </Link>
            );
          })}
        </Column>
      ))}
    </Column>
  );
}
