import React from 'react';
import MetricsTable from './MetricsTable';
import { percentFilter } from 'lib/filters';
import { FormattedMessage } from 'react-intl';
import FilterLink from 'components/common/FilterLink';
import useCountryNames from 'hooks/useCountryNames';
import useLocale from 'hooks/useLocale';

export default function CountriesTable({ websiteId, onDataLoad, ...props }) {
  const { locale } = useLocale();
  const countryNames = useCountryNames(locale);

  function renderLink({ x: code }) {
    return (
      <div className={locale}>
        <FilterLink
          id="country"
          value={code}
          label={
            countryNames[code] ?? <FormattedMessage id="label.unknown" defaultMessage="Unknown" />
          }
        />
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
      renderLabel={renderLink}
    />
  );
}
