import { Row, Column } from 'react-basics';
import Favicon from 'components/common/Favicon';
import OverflowText from 'components/common/OverflowText';
import PageHeader from 'components/layout/PageHeader';
import ActiveUsers from './ActiveUsers';
import styles from './WebsiteHeader.module.css';

export default function WebsiteHeader({ websiteId, title, domain }) {
  return (
    <PageHeader>
      <Row>
        <Column className={styles.title} variant="two">
          <Favicon domain={domain} />
          <OverflowText tooltipId={`${websiteId}-title`}>{title}</OverflowText>
        </Column>
        <Column className={styles.active} variant="two">
          <ActiveUsers websiteId={websiteId} />
        </Column>
      </Row>
    </PageHeader>
  );
}
