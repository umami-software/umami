import useMessages from 'components/hooks/useMessages';
import MetricsTable, { MetricsTableProps } from 'components/metrics/MetricsTable';

export function PageviewCustomDataTable(props: MetricsTableProps) {
  const { formatMessage, labels } = useMessages();

  function renderLink({ x: field }) {
    return <>{field}</>;
  }

  function titleize(fieldName: string) {
    return fieldName
      .split(/[_-]/)
      .map((word, i) => (i === 0 ? word[0].toUpperCase() + word.slice(1) : word))
      .join(' ');
  }

  return (
    <MetricsTable
      {...props}
      title={titleize(props.fieldName)}
      type="custom"
      metric={formatMessage(labels.visitors)}
      renderLabel={renderLink}
    />
  );
}

export default PageviewCustomDataTable;
