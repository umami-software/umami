import MetricsTable, { MetricsTableProps } from './MetricsTable';
import FilterLink from 'components/common/FilterLink';
import useMessages from 'components/hooks/useMessages';

const names = {
  'Mac OS': 'macOS',
  'Chrome OS': 'ChromeOS',
  'Sun OS': 'SunOS',
};

export function OSTable(props: MetricsTableProps) {
  const { formatMessage, labels } = useMessages();

  function renderLink({ x: os }) {
    return (
      <FilterLink id="os" value={names[os] || os}>
        <img
          src={`${process.env.basePath || ''}/images/os/${
            os?.toLowerCase().replaceAll(/\W/g, '-') || 'unknown'
          }.png`}
          alt={os}
          width={16}
          height={16}
        />
      </FilterLink>
    );
  }

  return (
    <MetricsTable
      {...props}
      type="os"
      title={formatMessage(labels.os)}
      metric={formatMessage(labels.visitors)}
      renderLabel={renderLink}
    />
  );
}

export default OSTable;
