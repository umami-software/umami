import { KeyRound, Settings2, ShieldCheck, UserCircle, Users } from '@/components/icons';
import { useConfig } from './useConfig';
import { useMessages } from './useMessages';
import { useNavigation } from './useNavigation';

export function useSettingsNavItems() {
  const { t, labels } = useMessages();
  const { pathname, renderUrl } = useNavigation();
  const { cloudMode } = useConfig();

  const items = [
    {
      label: t(labels.settings),
      items: [
        {
          id: 'preferences',
          label: t(labels.preferences),
          path: renderUrl('/settings/preferences'),
          icon: <Settings2 />,
        },
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
        ...(!cloudMode
          ? [
              {
                id: 'api-keys',
                label: t(labels.apiKeys),
                path: renderUrl('/settings/api-keys'),
                icon: <KeyRound />,
              },
            ]
          : []),
      ],
    },
  ];

  const selectedKey = items
    .flatMap(e => e.items)
    .find(({ path }) => path && pathname.includes(path.split('?')[0]))?.id;

  return { items, selectedKey };
}
