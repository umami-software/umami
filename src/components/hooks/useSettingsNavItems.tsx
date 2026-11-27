import { KeyRound, Server, Settings2, ShieldCheck, Users } from '@/components/icons';
import { useApp } from '@/store/app';
import { useConfig } from './useConfig';
import { useMessages } from './useMessages';
import { useNavigation } from './useNavigation';

export function useSettingsNavItems() {
  const { t, labels } = useMessages();
  const { pathname, renderUrl } = useNavigation();
  const { settingsEnabled, settingsOverride } = useConfig();
  const user = useApp(state => state.user);

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
        {
          id: 'api-keys',
          label: t(labels.apiKeys),
          path: renderUrl('/settings/api-keys'),
          icon: <KeyRound />,
        },
        ...(settingsEnabled && user && (settingsOverride || user.isAdmin)
          ? [
              {
                id: 'installation',
                label: t(labels.installation),
                path: renderUrl('/settings/installation'),
                icon: <Server />,
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
