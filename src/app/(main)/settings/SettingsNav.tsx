import { NavMenu } from '@/components/common/NavMenu';
import { useMessages, useNavigation } from '@/components/hooks';
import { Settings2, UserCircle, Users } from '@/components/icons';

export function SettingsNav({ onItemClick }: { onItemClick?: () => void }) {
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
    <NavMenu
      items={items}
      title={t(labels.settings)}
      selectedKey={selectedKey}
      allowMinimize={false}
      onItemClick={onItemClick}
    />
  );
}
