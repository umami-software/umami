import React from 'react';
import { FormattedMessage } from 'react-intl';
import Link from 'components/common/Link';
import PageHeader from 'components/layout/PageHeader';
import RefreshButton from 'components/common/RefreshButton';
import ButtonLayout from 'components/layout/ButtonLayout';
import ActiveUsers from './ActiveUsers';
import Arrow from 'assets/arrow-right.svg';
import styles from './WebsiteHeader.module.css';

export default function WebsiteHeader({ websiteId, token, title, showLink = false }) {
  return (
    <PageHeader>
      <div className={styles.title}>{title}</div>
      <ActiveUsers className={styles.active} websiteId={websiteId} token={token} />
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
            <FormattedMessage id="button.view-details" defaultMessage="View details" />
          </Link>
        )}
      </ButtonLayout>
    </PageHeader>
  );
}
