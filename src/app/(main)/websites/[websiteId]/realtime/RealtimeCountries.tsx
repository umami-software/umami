import { useCallback } from 'react';
import ListTable from '@/components/metrics/ListTable';
import { useLocale, useCountryNames, useMessages } from '@/components/hooks';
import classNames from 'classnames';
import styles from './RealtimeCountries.module.css';
import TypeIcon from '@/components/common/TypeIcon';

export function RealtimeCountries({ data }) {
  const { formatMessage, labels } = useMessages();
  const { locale } = useLocale();
  const { countryNames } = useCountryNames(locale);

  const renderCountryName = useCallback(
    ({ x: code }) => (
      <span className={classNames(styles.row)}>
        <TypeIcon type="country" value={code?.toLowerCase()} />
        {countryNames[code]}
      </span>
    ),
    [countryNames, locale],
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
