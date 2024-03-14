import classNames from 'classnames';
import Favicon from 'components/common/Favicon';
import { useMessages, useWebsite } from 'components/hooks';
import Icons from 'components/icons';
import ActiveUsers from 'components/metrics/ActiveUsers';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { Button, Icon, Text } from 'react-basics';
import styles from './WebsiteHeader.module.css';

export function WebsiteHeader({
  websiteId,
  showLinks = true,
  children,
}: {
  websiteId: string;
  showLinks?: boolean;
  children?: ReactNode;
}) {
  const { formatMessage, labels } = useMessages();
  const pathname = usePathname();
  const { data: website } = useWebsite(websiteId);
  const { name, domain } = website || {};

  const links = [
    {
      label: formatMessage(labels.overview),
      icon: <Icons.Overview />,
      path: '',
    },
    {
      label: formatMessage(labels.realtime),
      icon: <Icons.Clock />,
      path: '/realtime',
    },
    {
      label: formatMessage(labels.reports),
      icon: <Icons.Reports />,
      path: '/reports',
    },
    {
      label: formatMessage(labels.eventData),
      icon: <Icons.Nodes />,
      path: '/event-data',
    },
  ];

  return (
    <div className={styles.header}>
      <div className={styles.title}>
        <Favicon domain={domain} />
        <Text>{name}</Text>
        <ActiveUsers websiteId={websiteId} />
      </div>
      <div className={styles.actions}>
        {showLinks && (
          <div className={styles.links}>
            {links.map(({ label, icon, path }) => {
              const selected = path
                ? pathname.endsWith(path)
                : pathname.match(/^\/websites\/[\w-]+$/);

              return (
                <Link key={label} href={`/websites/${websiteId}${path}`} shallow={true}>
                  <Button
                    variant="quiet"
                    className={classNames({
                      [styles.selected]: selected,
                    })}
                  >
                    <Icon className={styles.icon}>{icon}</Icon>
                    <Text className={styles.label}>{label}</Text>
                  </Button>
                </Link>
              );
            })}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export default WebsiteHeader;
