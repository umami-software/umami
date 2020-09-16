import React from 'react';
import { FormattedMessage } from 'react-intl';
import Link from 'components/common/Link';
import PageHeader from 'components/layout/PageHeader';
import ActiveUsers from './ActiveUsers';
import Arrow from 'assets/arrow-right.svg';
import styles from './WebsiteHeader.module.css';
import RefreshButton from '../common/RefreshButton';
import ButtonLayout from '../layout/ButtonLayout';
import Icon from '../common/Icon';

export default function WebsiteHeader({ websiteId, title, showLink = false }) {
  return (
    <PageHeader>
      <div className={styles.title}>{title}</div>
      <ActiveUsers className={styles.active} websiteId={websiteId} />
      <ButtonLayout>
        <RefreshButton websiteId={websiteId} />
        {showLink && (
          <Link
            href="/website/[...id]"
            as={`/website/${websiteId}/${title}`}
            className={styles.link}
          >
            <FormattedMessage id="button.view-details" defaultMessage="View details" />
            <Icon icon={<Arrow />} size="small" />
          </Link>
        )}
      </ButtonLayout>
    </PageHeader>
  );
}
