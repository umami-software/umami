import { MetricsTable, MetricsTableProps } from './MetricsTable';
import { FilterLink } from '@/components/common/FilterLink';
import { useMessages } from '@/components/hooks';
import { Flexbox } from '@umami/react-zen';

export function HostnamesTable(props: MetricsTableProps) {
  const { formatMessage, labels } = useMessages();

  const renderLink = ({ x: hostname }) => {
    return (
      <Flexbox alignItems="center">
        <FilterLink
          id="hostname"
          value={hostname}
          externalUrl={`https://${hostname}`}
          label={!hostname && formatMessage(labels.none)}
        />
      </Flexbox>
    );
  };

  return (
    <>
      <MetricsTable
        {...props}
        title={formatMessage(labels.hostname)}
        type="hostname"
        metric={formatMessage(labels.visitors)}
        renderLabel={renderLink}
      />
    </>
  );
}
