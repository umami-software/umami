import MetricsTable, { MetricsTableProps } from './MetricsTable';
import FilterLink from '@/components/common/FilterLink';
import { useMessages } from '@/components/hooks';
import { Flexbox } from 'react-basics';

export function HostsTable(props: MetricsTableProps) {
  const { formatMessage, labels } = useMessages();

  const renderLink = ({ x: host }) => {
    return (
      <Flexbox alignItems="center">
        <FilterLink
          id="host"
          value={host}
          externalUrl={`https://${host}`}
          label={!host && formatMessage(labels.none)}
        />
      </Flexbox>
    );
  };

  return (
    <>
      <MetricsTable
        {...props}
        title={formatMessage(labels.hosts)}
        type="host"
        metric={formatMessage(labels.visitors)}
        renderLabel={renderLink}
      />
    </>
  );
}

export default HostsTable;
