import { NavMenu } from '@/components/common/NavMenu';
import { useMessages, useNavigation } from '@/components/hooks';
import { Globe, User, Users } from '@/components/icons';

export function AdminNav({ onItemClick }: { onItemClick?: () => void }) {
  const { t, labels } = useMessages();
  const { pathname } = useNavigation();

  const items = [
    {
      label: t(labels.manage),
      items: [
        {
          id: 'users',
          label: t(labels.users),
          path: '/admin/users',
          icon: <User />,
        },
        {
          id: 'websites',
          label: t(labels.websites),
          path: '/admin/websites',
          icon: <Globe />,
        },
        {
          id: 'teams',
          label: t(labels.teams),
          path: '/admin/teams',
          icon: <Users />,
        },
      ],
    },
  ];

  const selectedKey = items
    .flatMap(e => e.items)
    ?.find(({ path }) => path && pathname.startsWith(path))?.id;

  return (
    <NavMenu
      items={items}
      title={t(labels.admin)}
      selectedKey={selectedKey}
      allowMinimize={false}
      onItemClick={onItemClick}
    />
  );
}
