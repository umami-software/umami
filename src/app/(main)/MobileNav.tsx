import { WebsiteNav } from '@/app/(main)/websites/[websiteId]/WebsiteNav';
import { useMessages, useNavigation } from '@/components/hooks';
import { Globe, Grid2x2, LinkIcon } from '@/components/icons';
import { MobileMenuButton } from '@/components/input/MobileMenuButton';
import { NavButton } from '@/components/input/NavButton';
import { Logo } from '@/components/svg';
import { Grid, IconLabel, NavMenu, NavMenuItem, Row, Text } from '@umami/react-zen';
import Link from 'next/link';
import { AdminNav } from './admin/AdminNav';
import { SettingsNav } from './settings/SettingsNav';

export function MobileNav() {
  const { formatMessage, labels } = useMessages();
  const { pathname, websiteId, renderUrl } = useNavigation();
  const isAdmin = pathname.includes('/admin');
  const isSettings = pathname.includes('/settings');

  const links = [
    {
      id: 'websites',
      label: formatMessage(labels.websites),
      path: '/websites',
      icon: <Globe />,
    },
    {
      id: 'links',
      label: formatMessage(labels.links),
      path: '/links',
      icon: <LinkIcon />,
    },
    {
      id: 'pixels',
      label: formatMessage(labels.pixels),
      path: '/pixels',
      icon: <Grid2x2 />,
    },
  ];

  return (
    <Grid columns="auto 1fr" flexGrow={1} backgroundColor="3" borderRadius>
      <MobileMenuButton>
        {({ close }) => {
          return (
            <>
              <NavMenu padding="3" onItemClick={close} border="bottom">
                <NavButton />
                {links.map(link => {
                  return (
                    <Link key={link.id} href={renderUrl(link.path)}>
                      <NavMenuItem>
                        <IconLabel icon={link.icon} label={link.label} />
                      </NavMenuItem>
                    </Link>
                  );
                })}
              </NavMenu>
              {websiteId && <WebsiteNav websiteId={websiteId} onItemClick={close} />}
              {isAdmin && <AdminNav onItemClick={close} />}
              {isSettings && <SettingsNav onItemClick={close} />}
            </>
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
