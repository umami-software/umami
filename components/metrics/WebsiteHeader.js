import { Row, Column } from 'react-basics';
import Favicon from 'components/common/Favicon';
import OverflowText from 'components/common/OverflowText';
import ActiveUsers from './ActiveUsers';
import styles from './WebsiteHeader.module.css';

export default function WebsiteHeader({ websiteId, title, domain, children }) {
  return (
    <Row className={styles.header} justifyContent="center">
      <Column className={styles.title} variant="two">
        <Favicon domain={domain} />
        <OverflowText tooltipId={`${websiteId}-title`}>{title}</OverflowText>
      </Column>
      <Column className={styles.body} variant="two">
        <ActiveUsers websiteId={websiteId} />
        {children}
      </Column>
    </Row>
  );
}
