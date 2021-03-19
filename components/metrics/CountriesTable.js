import React from 'react';
import MetricsTable from './MetricsTable';
import { percentFilter } from 'lib/filters';
import { FormattedMessage } from 'react-intl';
import useCountryNames from 'hooks/useCountryNames';
import useLocale from 'hooks/useLocale';

export default function CountriesTable({ websiteId, onDataLoad, ...props }) {
  const [locale] = useLocale();
  const countryNames = useCountryNames(locale);

  function renderLabel({ x }) {
    return (
      <div className={locale}>
        {countryNames[x] ?? <FormattedMessage id="label.unknown" defaultMessage="Unknown" />}
      </div>
    );
  }

  return (
    <MetricsTable
      {...props}
      title={<FormattedMessage id="metrics.countries" defaultMessage="Countries" />}
      type="country"
      metric={<FormattedMessage id="metrics.visitors" defaultMessage="Visitors" />}
      websiteId={websiteId}
      onDataLoad={data => onDataLoad?.(percentFilter(data))}
      renderLabel={renderLabel}
    />
  );
}
