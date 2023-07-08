import { Flexbox, Row, Column, Text, Button, Icon } from 'react-basics';
import Favicon from 'components/common/Favicon';
import ActiveUsers from './ActiveUsers';
import styles from './WebsiteHeader.module.css';
import { useMessages } from 'hooks';
import Icons from 'components/icons';

export function WebsiteHeader({ websiteId, name, domain, children }) {
  const { formatMessage, labels } = useMessages();

  const links = [
    { label: formatMessage(labels.overview), icon: <Icons.Overview /> },
    { label: formatMessage(labels.realtime), icon: <Icons.Clock /> },
    { label: formatMessage(labels.reports), icon: <Icons.Reports /> },
    { label: formatMessage(labels.eventData), icon: <Icons.Nodes /> },
  ];

  return (
    <Row className={styles.header} justifyContent="center">
      <Column className={styles.title} variant="two">
        <Favicon domain={domain} />
        <Text>{name}</Text>
      </Column>
      <Column className={styles.actions} variant="two">
        <ActiveUsers websiteId={websiteId} />
        <Flexbox alignItems="center">
          {links.map(({ label, icon }) => {
            return (
              <Button key={label} variant="quiet">
                <Icon>{icon}</Icon>
                <Text>{label}</Text>
              </Button>
            );
          })}
        </Flexbox>
        {children}
      </Column>
    </Row>
  );
}

export default WebsiteHeader;
