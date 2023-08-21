import classNames from 'classnames';
import { Row, Column, Text, Button, Icon } from 'react-basics';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Favicon from 'components/common/Favicon';
import ActiveUsers from 'components/metrics/ActiveUsers';
import Icons from 'components/icons';
import { useMessages, useWebsite } from 'components/hooks';
import styles from './WebsiteHeader.module.css';

export function WebsiteHeader({ websiteId, showLinks = true, children }) {
  const { formatMessage, labels } = useMessages();
  const { pathname } = useRouter();
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
    <Row className={styles.header} justifyContent="center">
      <Column className={styles.title} variant="two">
        <Favicon domain={domain} />
        <Text>{name}</Text>
        <ActiveUsers websiteId={websiteId} />
      </Column>
      <Column className={styles.actions} variant="two">
        {showLinks && (
          <div className={styles.links}>
            {links.map(({ label, icon, path }) => {
              const selected = path ? pathname.endsWith(path) : pathname === '/websites/[id]';

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
      </Column>
    </Row>
  );
}

export default WebsiteHeader;
