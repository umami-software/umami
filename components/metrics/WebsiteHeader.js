import React from 'react';
import { useRouter } from 'next/router';
import PageHeader from 'components/layout/PageHeader';
import Link from 'components/common/Link';
import Button from 'components/common/Button';
import ActiveUsers from './ActiveUsers';
import Arrow from 'assets/arrow-right.svg';
import styles from './WebsiteHeader.module.css';

export default function WebsiteHeader({ websiteId, name, showLink = false }) {
  const router = useRouter();

  return (
    <PageHeader>
      {showLink ? (
        <Link href="/website/[...id]" as={`/website/${websiteId}/${name}`} className={styles.title}>
          {name}
        </Link>
      ) : (
        <div className={styles.title}>{name}</div>
      )}
      <ActiveUsers className={styles.active} websiteId={websiteId} />
      {showLink && (
        <Button
          icon={<Arrow />}
          onClick={() =>
            router.push('/website/[...id]', `/website/${websiteId}/${name}`, {
              shallow: true,
            })
          }
          size="small"
        >
          <div>View details</div>
        </Button>
      )}
    </PageHeader>
  );
}
