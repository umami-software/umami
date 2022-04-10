import React from 'react';
import MetricsTable from './MetricsTable';
import { useIntl, FormattedMessage } from 'react-intl';
import { getDeviceMessage } from 'components/messages';
import FilterLink from 'components/common/FilterLink';

export default function DevicesTable({ websiteId, ...props }) {
  const { formatMessage } = useIntl();

  function renderLink({ x: device }) {
    return (
      <FilterLink id="device" value={device} label={formatMessage(getDeviceMessage(device))} />
    );
  }

  return (
    <MetricsTable
      {...props}
      title={<FormattedMessage id="metrics.devices" defaultMessage="Devices" />}
      type="device"
      metric={<FormattedMessage id="metrics.visitors" defaultMessage="Visitors" />}
      websiteId={websiteId}
      renderLabel={renderLink}
    />
  );
}
