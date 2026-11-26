import { Column, Grid, Row, SidebarMenuButton, Text } from '@umami/react-zen';
import { MetricsNav, WebsiteNav } from '@/app/(main)/websites/[websiteId]/WebsiteNav';
import { IconLabel } from '@/components/common/IconLabel';
import Link from '@/components/common/Link';
import { isMetricsPath, useConfig, useMessages, useNavigation } from '@/components/hooks';
import {
  Globe,
  Grid2x2,
  LayoutDashboard,
  LinkIcon,
  PanelsLeftBottom,
  Settings,
} from '@/components/icons';
import { MobileMenuButton } from '@/components/input/MobileMenuButton';
import { UserButton } from '@/components/input/UserButton';
import { Logo } from '@/components/svg';
import { AdminNav } from './admin/AdminNav';
import { SettingsNav } from './settings/SettingsNav';

export function MobileNav() {
  const { t, labels } = useMessages();
  const { pathname, websiteId, teamId, renderUrl } = useNavigation();
  const { settingsEnabled } = useConfig();
  const settingsUrl = settingsEnabled ? '/settings' : `${process.env.cloudUrl}/settings`;
  const isAdmin = pathname.includes('/admin');
  const isSettings = pathname.includes('/settings');
  const isMetrics = isMetricsPath(pathname);
  const isMain = !websiteId && !isMetrics && !isAdmin && !isSettings;

  const links = [
    ...(!teamId
      ? [
          {
            id: 'dashboard',
            label: t(labels.dashboard),
            path: '/dashboard',
            icon: <PanelsLeftBottom />,
          },
        ]
      : []),
    {
      id: 'boards',
      label: t(labels.boards),
      path: '/boards',
      icon: <LayoutDashboard />,
    },
    {
      id: 'websites',
      label: t(labels.websites),
      path: '/websites',
      icon: <Globe />,
    },
    {
      id: 'links',
      label: t(labels.links),
      path: '/links',
      icon: <LinkIcon />,
    },
    {
      id: 'pixels',
      label: t(labels.pixels),
      path: '/pixels',
      icon: <Grid2x2 />,
    },
  ];

  return (
    <Grid columns="auto 1fr" flexGrow={1} backgroundColor="muted" borderRadius>
      <MobileMenuButton>
        {({ close }) => {
          return (
            <Column gap="2" display="flex" flex-direction="column" padding="1" height="100%">
              {isMain &&
                links.map(link => {
                  return (
                    <Row key={link.id} padding>
                      <Link href={renderUrl(link.path)} onClick={close}>
                        <IconLabel icon={link.icon} label={link.label} />
                      </Link>
                    </Row>
                  );
                })}
              {isMetrics ? (
                <MetricsNav onItemClick={close} />
              ) : (
                websiteId && <WebsiteNav websiteId={websiteId} onItemClick={close} />
              )}
              {isAdmin && <AdminNav onItemClick={close} />}
              {isSettings && <SettingsNav onItemClick={close} />}
              <Column style={{ marginTop: 'auto' }}>
                {!isSettings && (
                  <SidebarMenuButton render={<Link href={settingsUrl} onClick={close} />}>
                    <Settings />
                    <span>{t(labels.settings)}</span>
                  </SidebarMenuButton>
                )}
                <UserButton onClose={close} />
              </Column>
            </Column>
          );
        }}
      </MobileMenuButton>
      <Row alignItems="center" justifyContent="center" flexGrow={1}>
        <IconLabel icon={<Logo />} style={{ width: 'auto' }}>
          <Text weight="bold">umami</Text>
        </IconLabel>
      </Row>
    </Grid>
  );
}
