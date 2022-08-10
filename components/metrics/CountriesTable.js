import React from 'react';
import MetricsTable from './MetricsTable';
import { percentFilter } from 'lib/filters';
import { useIntl, defineMessages } from 'react-intl';
import FilterLink from 'components/common/FilterLink';
import useCountryNames from 'hooks/useCountryNames';
import useLocale from 'hooks/useLocale';

const messages = defineMessages({
  unknown: { id: 'label.unknown', defaultMessage: 'Unknown' },
  countries: { id: 'metrics.countries', defaultMessage: 'Countries' },
  visitors: { id: 'metrics.visitors', defaultMessage: 'Visitors' },
});

export default function CountriesTable({ websiteId, onDataLoad, ...props }) {
  const { locale } = useLocale();
  const countryNames = useCountryNames(locale);
  const { formatMessage } = useIntl();

  function renderLink({ x: code }) {
    return (
      <div className={locale}>
        <FilterLink
          id="country"
          value={code}
          label={countryNames[code] ?? formatMessage(messages.unknown)}
        />
      </div>
    );
  }

  return (
    <MetricsTable
      {...props}
      title={formatMessage(messages.countries)}
      type="country"
      metric={formatMessage(messages.visitors)}
      websiteId={websiteId}
      onDataLoad={data => onDataLoad?.(percentFilter(data))}
      renderLabel={renderLink}
    />
  );
}
