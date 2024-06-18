import MetricsTable, { MetricsTableProps } from './MetricsTable';
import FilterLink from 'components/common/FilterLink';
import Favicon from 'components/common/Favicon';
import { useMessages } from 'components/hooks';
import { Flexbox } from 'react-basics';

export function ReferrersTable(props: MetricsTableProps) {
  const { formatMessage, labels } = useMessages();

  const renderLink = ({ x: referrer }) => {
    return (
      <Flexbox alignItems="center">
        <Favicon domain={referrer} />
        <FilterLink
          id="referrer"
          value={referrer}
          externalUrl={`https://${referrer}`}
          label={!referrer && formatMessage(labels.none)}
        />
      </Flexbox>
    );
  };

  return (
    <>
      <MetricsTable
        {...props}
        title={formatMessage(labels.referrers)}
        type="referrer"
        metric={formatMessage(labels.views)}
        renderLabel={renderLink}
      />
    </>
  );
}

export default ReferrersTable;
