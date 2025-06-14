import { MetricsTable, MetricsTableProps } from './MetricsTable';
import { useLocale } from '@/components/hooks';
import { useMessages } from '@/components/hooks';
import { useFormat } from '@/components/hooks';

export function LanguagesTable(props: MetricsTableProps) {
  const { formatMessage, labels } = useMessages();
  const { locale } = useLocale();
  const { formatLanguage } = useFormat();

  const renderLabel = ({ x }) => {
    return <div className={locale}>{formatLanguage(x)}</div>;
  };

  return (
    <MetricsTable
      {...props}
      title={formatMessage(labels.languages)}
      type="language"
      metric={formatMessage(labels.visitors)}
      renderLabel={renderLabel}
      searchFormattedValues={true}
    />
  );
}
