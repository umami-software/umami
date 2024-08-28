import MetricsTable, { MetricsTableProps } from './MetricsTable';
import { percentFilter } from 'lib/filters';
import { useIntl } from 'react-intl';
import { useLocale } from 'components/hooks';
import { useMessages } from 'components/hooks';

export function LanguagesTable({
  onDataLoad,
  ...props
}: { onDataLoad: (data: any) => void } & MetricsTableProps) {
  const { formatMessage, labels } = useMessages();
  const { locale } = useLocale();
  const intl = useIntl();

  const renderLabel = ({ x }) => {
    return (
      <div className={locale}>
        {intl.formatDisplayName(x?.split('-')[0], { type: 'language' }) ?? x}
      </div>
    );
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
