import { Row, Column } from 'react-basics';
import Favicon from 'components/common/Favicon';
import OverflowText from 'components/common/OverflowText';
import RefreshButton from 'components/common/RefreshButton';
import ButtonLayout from 'components/layout/ButtonLayout';
import PageHeader from 'components/layout/PageHeader';
import ActiveUsers from './ActiveUsers';
import styles from './WebsiteHeader.module.css';

export default function WebsiteHeader({ websiteId, title, domain }) {
  return (
    <PageHeader>
      <Row>
        <Column className={styles.title} xs={12} sm={12} md={4} lg={4}>
          <Favicon domain={domain} />
          <OverflowText tooltipId={`${websiteId}-title`}>{title}</OverflowText>
        </Column>
        <Column className={styles.active} xs={12} sm={12} md={4} lg={4}>
          <ActiveUsers websiteId={websiteId} />
        </Column>
        <Column xs={12} sm={12} md={4} lg={4}>
          <ButtonLayout align="right">
            <RefreshButton websiteId={websiteId} />
          </ButtonLayout>
        </Column>
      </Row>
    </PageHeader>
  );
}
