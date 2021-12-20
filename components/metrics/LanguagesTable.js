import React from 'react';
import MetricsTable from './MetricsTable';
import { percentFilter } from 'lib/filters';
import { FormattedMessage } from 'react-intl';
import useLanguageNames from 'hooks/useLanguageNames';
import useLocale from 'hooks/useLocale';

export default function LanguagesTable({ websiteId, onDataLoad, ...props }) {
  const { locale } = useLocale();
  const languageNames = useLanguageNames(locale);

  function renderLabel({ x }) {
    return (
      <div className={locale}>
        {languageNames[x] ?? <FormattedMessage id="label.unknown" defaultMessage="Unknown" />}{' '}
      </div>
    );
  }

  return (
    <MetricsTable
      {...props}
      title={<FormattedMessage id="metrics.languages" defaultMessage="Languages" />}
      type="language"
      metric={<FormattedMessage id="metrics.visitors" defaultMessage="Visitors" />}
      websiteId={websiteId}
      onDataLoad={data => onDataLoad?.(percentFilter(data))}
      renderLabel={renderLabel}
    />
  );
}
