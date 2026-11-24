import { Globe, ShieldCheck, User, Users } from '@/components/icons';
import { useMessages } from './useMessages';
import { useNavigation } from './useNavigation';

export function useAdminNavItems() {
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
        {
          id: 'security',
          label: t(labels.security),
          path: '/admin/security',
          icon: <ShieldCheck />,
        },
      ],
    },
  ];

  const selectedKey = items
    .flatMap(e => e.items)
    .find(({ path }) => path && pathname.startsWith(path))?.id;

  return { items, selectedKey };
}
