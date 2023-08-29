import MetricsTable from './MetricsTable';
import FilterLink from 'components/common/FilterLink';
import useMessages from 'components/hooks/useMessages';

export function ReferrersTable({ websiteId, ...props }) {
  const { formatMessage, labels } = useMessages();

  const renderLink = ({ x: referrer }) => {
    return (
      <FilterLink
        id="referrer"
        value={referrer}
        externalUrl={`https://${referrer}`}
        label={!referrer && formatMessage(labels.none)}
      />
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

export default ReferrersTable;
