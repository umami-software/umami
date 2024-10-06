import useMessages from './useMessages';
import { BROWSERS, OS_NAMES } from 'lib/constants';
import { useIntl } from 'react-intl';
import regions from '../../../public/iso-3166-2.json';

export function useFormat() {
  const { formatMessage, labels } = useMessages();
  const intl = useIntl();

  const formatOS = (value: string): string => {
    return OS_NAMES[value] || value;
  };

  const formatBrowser = (value: string): string => {
    return BROWSERS[value] || value;
  };

  const formatDevice = (value: string): string => {
    return formatMessage(labels[value] || labels.unknown);
  };

  const formatCountry = (value: string): string => {
    return intl.formatDisplayName(value, { type: 'region' }) || value;
  };

  const formatRegion = (value: string): string => {
    const [country] = value.split('-');
    return regions[value]
      ? `${regions[value]}, ${intl.formatDisplayName(country, { type: 'region' })}`
      : value;
  };

  const formatCity = (value: string, country?: string): string => {
    return intl.formatDisplayName(country, { type: 'region' })
      ? `${value}, ${intl.formatDisplayName(country, { type: 'region' })}`
      : value;
  };

  const formatValue = (value: string, type: string, data?: { [key: string]: any }): string => {
    switch (type) {
      case 'os':
        return formatOS(value);
      case 'browser':
        return formatBrowser(value);
      case 'device':
        return formatDevice(value);
      case 'country':
        return formatCountry(value);
      case 'region':
        return formatRegion(value);
      case 'city':
        return formatCity(value, data?.country);
      default:
        return value;
    }
  };

  return { formatOS, formatBrowser, formatDevice, formatCountry, formatRegion, formatValue };
}

export default useFormat;
