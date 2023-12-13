import useMessages from './useMessages';
import { BROWSERS } from 'lib/constants';
import useLocale from './useLocale';
import useCountryNames from './useCountryNames';
import regions from 'public/iso-3166-2.json';

export function useFormat() {
  const { formatMessage, labels } = useMessages();
  const { locale } = useLocale();
  const countryNames = useCountryNames(locale);

  const formatBrowser = (value: string): string => {
    return BROWSERS[value] || value;
  };

  const formatCountry = (value: string): string => {
    return countryNames[value] || value;
  };

  const formatRegion = (value: string): string => {
    const [country] = value.split('-');
    return regions[value] ? `${regions[value]}, ${countryNames[country]}` : value;
  };

  const formatCity = (value: string, country?: string): string => {
    return `${value}, ${countryNames[country]}`;
  };

  const formatDevice = (value: string): string => {
    return formatMessage(labels[value] || labels.unknown);
  };

  const formatValue = (value: string, type: string, data?: { [key: string]: any }): string => {
    switch (type) {
      case 'browser':
        return formatBrowser(value);
      case 'country':
        return formatCountry(value);
      case 'region':
        return formatRegion(value);
      case 'city':
        return formatCity(value, data?.country);
      case 'device':
        return formatDevice(value);
      default:
        return value;
    }
  };

  return { formatBrowser, formatCountry, formatRegion, formatDevice, formatValue };
}

export default useFormat;
