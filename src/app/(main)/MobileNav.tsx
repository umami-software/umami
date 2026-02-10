import { Column, Grid, Row, Text } from '@umami/react-zen';
import Link from 'next/link';
import { WebsiteNav } from '@/app/(main)/websites/[websiteId]/WebsiteNav';
import { IconLabel } from '@/components/common/IconLabel';
import { useMessages, useNavigation } from '@/components/hooks';
import { Globe, Grid2x2, LayoutDashboard, LinkIcon } from '@/components/icons';
import { MobileMenuButton } from '@/components/input/MobileMenuButton';
import { UserButton } from '@/components/input/UserButton';
import { Logo } from '@/components/svg';
import { AdminNav } from './admin/AdminNav';
import { SettingsNav } from './settings/SettingsNav';

export function MobileNav() {
  const { t, labels } = useMessages();
  const { pathname, websiteId, renderUrl } = useNavigation();
  const isAdmin = pathname.includes('/admin');
  const isSettings = pathname.includes('/settings');
  const isMain = !websiteId && !isAdmin && !isSettings;

  const links = [
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
    <Grid columns="auto 1fr" flexGrow={1} backgroundColor="surface-sunken" borderRadius>
      <MobileMenuButton>
        {({ close }) => {
          return (
            <Column gap="2" display="flex" flex-direction="column" height="100vh" padding="1">
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
              {websiteId && <WebsiteNav websiteId={websiteId} onItemClick={close} />}
              {isAdmin && <AdminNav onItemClick={close} />}
              {isSettings && <SettingsNav onItemClick={close} />}
              <Row onClick={close} style={{ marginTop: 'auto' }}>
                <UserButton />
              </Row>
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
