import classNames from 'classnames';
import { Flexbox, Row, Column, Text, Button, Icon } from 'react-basics';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Favicon from 'components/common/Favicon';
import ActiveUsers from 'components/metrics/ActiveUsers';
import styles from './WebsiteHeader.module.css';
import Icons from 'components/icons';
import { useMessages, useWebsite } from 'hooks';

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
      </Column>
      <Column className={styles.actions} variant="two">
        <ActiveUsers websiteId={websiteId} />
        {showLinks && (
          <Flexbox alignItems="center">
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
                    <Icon>{icon}</Icon>
                    <Text>{label}</Text>
                  </Button>
                </Link>
              );
            })}
          </Flexbox>
        )}
        {children}
      </Column>
    </Row>
  );
}

export default WebsiteHeader;
