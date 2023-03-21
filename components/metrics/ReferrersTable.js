import { useIntl } from 'react-intl';
import MetricsTable from './MetricsTable';
import FilterLink from 'components/common/FilterLink';
import { labels } from 'components/messages';

export default function ReferrersTable({ websiteId, ...props }) {
  const { formatMessage } = useIntl();

  const renderLink = ({ w: link, x: referrer }) => {
    return referrer ? (
      <FilterLink id="referrer" value={referrer} externalUrl={link} />
    ) : (
      `(${formatMessage(labels.none)})`
    );
  };

  return (
    <>
      <MetricsTable
        {...props}
        title={formatMessage(labels.referrers)}
        type="referrer"
        metric={formatMessage(labels.views)}
        websiteId={websiteId}
        renderLabel={renderLink}
      />
    </>
  );
}
