import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { labels } from 'components/messages';
import DataTable from 'components/metrics/DataTable';
import useLocale from 'hooks/useLocale';
import useCountryNames from 'hooks/useCountryNames';

export default function RealtimeCountries({ data }) {
  const { formatMessage } = useIntl();
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
