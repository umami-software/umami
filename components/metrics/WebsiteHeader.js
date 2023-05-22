import { Row, Column, Text } from 'react-basics';
import Favicon from 'components/common/Favicon';
import ActiveUsers from './ActiveUsers';
import styles from './WebsiteHeader.module.css';

export function WebsiteHeader({ websiteId, name, domain, children }) {
  return (
    <Row className={styles.header} justifyContent="center">
      <Column className={styles.title} variant="two">
        <Favicon domain={domain} />
        <Text>{name}</Text>
      </Column>
      <Column className={styles.info} variant="two">
        <ActiveUsers websiteId={websiteId} />
        {children}
      </Column>
    </Row>
  );
}

export default WebsiteHeader;
