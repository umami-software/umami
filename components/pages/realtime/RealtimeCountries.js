import { useCallback } from 'react';
import DataTable from 'components/metrics/DataTable';
import useLocale from 'hooks/useLocale';
import useCountryNames from 'hooks/useCountryNames';
import useMessages from 'hooks/useMessages';

export function RealtimeCountries({ data }) {
  const { formatMessage, labels } = useMessages();
  const { locale } = useLocale();
  const countryNames = useCountryNames(locale);

  const renderCountryName = useCallback(
    ({ x }) => <span className={locale}>{countryNames[x]}</span>,
    [countryNames, locale],
  );

  return (
    <DataTable
      title={formatMessage(labels.countries)}
      metric={formatMessage(labels.visitors)}
      data={data}
      renderLabel={renderCountryName}
    />
  );
}

export default RealtimeCountries;
