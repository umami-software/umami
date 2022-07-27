import React, { useState } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import MetricsTable from './MetricsTable';
import FilterButtons from 'components/common/FilterButtons';

export const UTM_SOURCE = 'utm_source';
export const UTM_MEDIUM = 'utm_medium';
export const UTM_CAMPAIGN = 'utm_campaign';
export const UTM_CONTENT = 'utm_content';
export const UTM_TERM = 'utm_term';

const messages = defineMessages({
  utm_source: { id: 'metrics.utm_source', defaultMessage: 'UTM Source' },
  utm_medium: { id: 'metrics.utm_medium', defaultMessage: 'UTM Medium' },
  utm_campaign: { id: 'metrics.utm_campaign', defaultMessage: 'UTM Campaign' },
  utm_content: { id: 'metrics.utm_content', defaultMessage: 'UTM Content' },
  utm_term: { id: 'metrics.utm_term', defaultMessage: 'UTM Term' },
  views: { id: 'metrics.views', defaultMessage: 'Views' },
  none: { id: 'label.none', defaultMessage: 'None' },
});

export default function UTMTable({ websiteId, showFilters, ...props }) {
  const [type, setType] = useState(UTM_SOURCE);
  const { formatMessage } = useIntl();

  const buttons = [
    { label: formatMessage(messages.utm_source), value: UTM_SOURCE },
    { label: formatMessage(messages.utm_medium), value: UTM_MEDIUM },
    { label: formatMessage(messages.utm_campaign), value: UTM_CAMPAIGN },
    { label: formatMessage(messages.utm_content), value: UTM_CONTENT },
    { label: formatMessage(messages.utm_term), value: UTM_TERM },
  ];

  return (
    <>
      {showFilters && <FilterButtons buttons={buttons} selected={type} onClick={setType} />}
      <MetricsTable
        {...props}
        title={formatMessage(messages[type])}
        type={type}
        metric={formatMessage(messages.views)}
        websiteId={websiteId}
        delay={0}
      />
    </>
  );
}
