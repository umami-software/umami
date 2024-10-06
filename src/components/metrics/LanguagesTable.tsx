import MetricsTable, { MetricsTableProps } from './MetricsTable';
import { percentFilter } from 'lib/filters';
import { useIntl } from 'react-intl';
import { useMessages } from 'components/hooks';

export function LanguagesTable({
  onDataLoad,
  ...props
}: { onDataLoad: (data: any) => void } & MetricsTableProps) {
  const { formatMessage, labels } = useMessages();
  const intl = useIntl();

  const renderLabel = ({ x }) => {
    return intl.formatDisplayName(x?.split('-')[0], { type: 'language' }) ?? x;
  };

  return (
    <MetricsTable
      {...props}
      title={formatMessage(labels.languages)}
      type="language"
      metric={formatMessage(labels.visitors)}
      onDataLoad={data => onDataLoad?.(percentFilter(data))}
      renderLabel={renderLabel}
    />
  );
}

export default LanguagesTable;
