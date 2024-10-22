import MetricsTable from './MetricsTable';
import { percentFilter } from 'lib/filters';
import useLanguageNames from 'components/hooks/useLanguageNames';
import useLocale from 'components/hooks/useLocale';
import useMessages from 'components/hooks/useMessages';

export function LanguagesTable({ websiteId, onDataLoad, ...props }) {
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
      websiteId={websiteId}
      onDataLoad={data => onDataLoad?.(percentFilter(data))}
      renderLabel={renderLabel}
    />
  );
}

export default LanguagesTable;
