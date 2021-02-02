import React from 'react';
import { FormattedMessage } from 'react-intl';
import Link from 'components/common/Link';
import PageHeader from 'components/layout/PageHeader';
import RefreshButton from 'components/common/RefreshButton';
import ButtonLayout from 'components/layout/ButtonLayout';
import Favicon from 'components/common/Favicon';
import ActiveUsers from './ActiveUsers';
import Arrow from 'assets/arrow-right.svg';
import styles from './WebsiteHeader.module.css';

export default function WebsiteHeader({ websiteId, title, domain, showLink = false }) {
  const header = showLink ? (
    <>
      <Favicon domain={domain} />
      <Link href="/website/[...id]" as={`/website/${websiteId}/${title}`}>
        {title}
      </Link>
    </>
  ) : (
    <div>
      <Favicon domain={domain} />
      {title}
    </div>
  );

  return (
    <PageHeader>
      <div className={styles.title}>{header}</div>
      <ActiveUsers className={styles.active} websiteId={websiteId} />
      <ButtonLayout align="right">
        <RefreshButton websiteId={websiteId} />
        {showLink && (
          <Link
            href="/website/[...id]"
            as={`/website/${websiteId}/${title}`}
            className={styles.link}
            icon={<Arrow />}
            size="small"
            iconRight
          >
            <FormattedMessage id="label.view-details" defaultMessage="View details" />
          </Link>
        )}
      </ButtonLayout>
    </PageHeader>
  );
}
