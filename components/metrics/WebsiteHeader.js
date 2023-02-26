import { Row, Column, Text } from 'react-basics';
import Favicon from 'components/common/Favicon';
import ActiveUsers from './ActiveUsers';
import styles from './WebsiteHeader.module.css';

export default function WebsiteHeader({ websiteId, title, domain, children }) {
  return (
    <Row className={styles.header} justifyContent="center">
      <Column className={styles.title} variant="two">
        <Favicon domain={domain} />
        <Text>{title}</Text>
      </Column>
      <Column className={styles.body} variant="two">
        <ActiveUsers websiteId={websiteId} />
        {children}
      </Column>
    </Row>
  );
}
