import { defineMessages } from 'react-intl';

export const labels = defineMessages({
  unknown: { id: 'label.unknown', defaultMessage: 'Unknown' },
});

export const devices = defineMessages({
  desktop: { id: 'metrics.device.desktop', defaultMessage: 'Desktop' },
  laptop: { id: 'metrics.device.laptop', defaultMessage: 'Laptop' },
  tablet: { id: 'metrics.device.tablet', defaultMessage: 'Tablet' },
  mobile: { id: 'metrics.device.mobile', defaultMessage: 'Mobile' },
});

export function getDeviceMessage(device) {
  return devices[device] || labels.unknown;
}
