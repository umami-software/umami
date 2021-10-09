import Arrow from 'assets/arrow-right.svg';
import Favicon from 'components/common/Favicon';
import Link from 'components/common/Link';
import RefreshButton from 'components/common/RefreshButton';
import ButtonLayout from 'components/layout/ButtonLayout';
import PageHeader from 'components/layout/PageHeader';
import { FormattedMessage } from 'react-intl';
import ActiveUsers from './ActiveUsers';
import styles from './WebsiteHeader.module.css';

export default function WebsiteHeader({ websiteId, title, domain, showLink = false, createdAt }) {
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
        <RefreshButton websiteId={websiteId} createdAt={createdAt} />
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
