import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useRouter } from 'next/router';
import PageHeader from 'components/layout/PageHeader';
import Button from 'components/common/Button';
import ActiveUsers from './ActiveUsers';
import Arrow from 'assets/arrow-right.svg';
import styles from './WebsiteHeader.module.css';
import RefreshButton from '../common/RefreshButton';
import ButtonLayout from '../layout/ButtonLayout';

export default function WebsiteHeader({ websiteId, title, showLink = false }) {
  const router = useRouter();

  return (
    <PageHeader>
      <div className={styles.title}>{title}</div>
      <ActiveUsers className={styles.active} websiteId={websiteId} />
      <ButtonLayout>
        <RefreshButton websiteId={websiteId} />
        {showLink && (
          <Button
            icon={<Arrow />}
            onClick={() =>
              router.push('/website/[...id]', `/website/${websiteId}/${title}`, {
                shallow: true,
              })
            }
            size="small"
          >
            <div>
              <FormattedMessage id="button.view-details" defaultMessage="View details" />
            </div>
          </Button>
        )}
      </ButtonLayout>
    </PageHeader>
  );
}
