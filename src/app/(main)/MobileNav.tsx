import {
  Row,
  Dialog,
  DialogTrigger,
  Button,
  Icon,
  Modal,
  NavMenu,
  NavMenuItem,
  IconLabel,
  Text,
  Grid,
} from '@umami/react-zen';
import { Globe, Grid2x2, LinkIcon, Menu } from '@/components/icons';
import { useMessages, useNavigation } from '@/components/hooks';
import Link from 'next/link';
import { WebsiteNav } from '@/app/(main)/websites/[websiteId]/WebsiteNav';
import { Logo } from '@/components/svg';

export function MobileNav() {
  const { formatMessage, labels } = useMessages();
  const { websiteId } = useNavigation();

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
    <Grid columns="auto 1fr" flexGrow={1}>
      <DialogTrigger>
        <Button>
          <Icon>
            <Menu />
          </Icon>
        </Button>
        <Modal position="left" offset="80px">
          <Dialog variant="sheet">
            <NavMenu padding="3">
              {links.map(link => {
                return (
                  <Link key={link.id} href={link.path}>
                    <NavMenuItem>
                      <IconLabel icon={link.icon} label={link.label} />
                    </NavMenuItem>
                  </Link>
                );
              })}
            </NavMenu>
            {websiteId && <WebsiteNav websiteId={websiteId} />}
          </Dialog>
        </Modal>
      </DialogTrigger>
      <Row alignItems="center" justifyContent="center" flexGrow={1}>
        <IconLabel icon={<Logo />} style={{ width: 'auto' }}>
          <Text weight="bold">umami</Text>
        </IconLabel>
      </Row>
    </Grid>
  );
}
