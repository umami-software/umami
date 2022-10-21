import Arrow from 'assets/arrow-right.svg';
import classNames from 'classnames';
import Favicon from 'components/common/Favicon';
import Link from 'components/common/Link';
import OverflowText from 'components/common/OverflowText';
import RefreshButton from 'components/common/RefreshButton';
import ButtonLayout from 'components/layout/ButtonLayout';
import PageHeader from 'components/layout/PageHeader';
import { FormattedMessage } from 'react-intl';
import ActiveUsers from './ActiveUsers';
import styles from './WebsiteHeader.module.css';

export default function WebsiteHeader({ websiteId, title, domain, showLink = false }) {
  const header = showLink ? (
    <>
      <Favicon domain={domain} />
      <Link
        className={styles.titleLink}
        href="/websites/[...id]"
        as={`/websites/${websiteId}/${title}`}
      >
        <OverflowText tooltipId={`${websiteId}-title`}>{title}</OverflowText>
      </Link>
    </>
  ) : (
    <>
      <Favicon domain={domain} />
      <OverflowText tooltipId={`${websiteId}-title`}>{title}</OverflowText>
    </>
  );

  return (
    <PageHeader className="row">
      <div className={classNames(styles.title, 'col-10 col-lg-4 order-1 order-lg-1')}>{header}</div>
      <div className={classNames(styles.active, 'col-12 col-lg-4 order-3 order-lg-2')}>
        <ActiveUsers websiteId={websiteId} />
      </div>
      <div className="col-2 col-lg-4 order-2 order-lg-3">
        <ButtonLayout align="right">
          <RefreshButton websiteId={websiteId} />
          {showLink && (
            <Link
              href="/websites/[...id]"
              as={`/websites/${websiteId}/${title}`}
              className={styles.link}
              icon={<Arrow />}
              size="small"
              iconRight
            >
              <FormattedMessage id="label.view-details" defaultMessage="View details" />
            </Link>
          )}
        </ButtonLayout>
      </div>
    </PageHeader>
  );
}
