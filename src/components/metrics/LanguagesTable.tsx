import MetricsTable, { MetricsTableProps } from './MetricsTable';
import { percentFilter } from 'lib/filters';
import { useLanguageNames } from 'components/hooks';
import { useLocale } from 'components/hooks';
import { useMessages } from 'components/hooks';

export function LanguagesTable({
  onDataLoad,
  ...props
}: { onDataLoad: (data: any) => void } & MetricsTableProps) {
  const { formatMessage, labels } = useMessages();
  const { locale } = useLocale();
  const languageNames = useLanguageNames(locale);

  const renderLabel = ({ x }) => {
    return <div className={locale}>{languageNames[x?.split('-')[0]] ?? x}</div>;
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
