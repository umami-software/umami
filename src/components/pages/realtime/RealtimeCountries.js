import { useCallback } from 'react';
import { useRouter } from 'next/router';
import ListTable from 'components/metrics/ListTable';
import useLocale from 'components/hooks/useLocale';
import useCountryNames from 'components/hooks/useCountryNames';
import useMessages from 'components/hooks/useMessages';
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
    <ListTable
      title={formatMessage(labels.countries)}
      metric={formatMessage(labels.visitors)}
      data={data}
      renderLabel={renderCountryName}
    />
  );
}

export default RealtimeCountries;
