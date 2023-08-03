import { useCallback } from 'react';
import { useRouter } from 'next/router';
import DataTable from 'components/metrics/DataTable';
import useLocale from 'hooks/useLocale';
import useCountryNames from 'hooks/useCountryNames';
import useMessages from 'hooks/useMessages';
import classNames from 'classnames';
import styles from './RealtimeCountries.module.css';

export function RealtimeCountries({ data }) {
  const { formatMessage, labels } = useMessages();
  const { locale } = useLocale();
  const countryNames = useCountryNames(locale);
  const { basePath } = useRouter();

  const renderCountryName = useCallback(
    ({ x: code }) => (
      <span className={classNames(locale, styles.row)}>
        <img src={`${basePath}/images/flags/${code?.toLowerCase() || 'xx'}.png`} alt={code} />
        {countryNames[code]}
      </span>
    ),
    [countryNames, locale, basePath],
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
