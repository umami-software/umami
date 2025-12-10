import { SideMenu } from '@/components/common/SideMenu';
import { useMessages, useNavigation } from '@/components/hooks';
import { Settings2, UserCircle, Users } from '@/components/icons';

export function SettingsNav({ onItemClick }: { onItemClick?: () => void }) {
  const { formatMessage, labels } = useMessages();
  const { renderUrl, pathname } = useNavigation();

  const items = [
    {
      label: formatMessage(labels.application),
      items: [
        {
          id: 'preferences',
          label: formatMessage(labels.preferences),
          path: renderUrl('/settings/preferences'),
          icon: <Settings2 />,
        },
      ],
    },
    {
      label: formatMessage(labels.account),
      items: [
        {
          id: 'profile',
          label: formatMessage(labels.profile),
          path: renderUrl('/settings/profile'),
          icon: <UserCircle />,
        },
        {
          id: 'teams',
          label: formatMessage(labels.teams),
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
    <SideMenu
      items={items}
      title={formatMessage(labels.settings)}
      selectedKey={selectedKey}
      allowMinimize={false}
      onItemClick={onItemClick}
    />
  );
}
