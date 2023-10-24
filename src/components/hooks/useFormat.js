import useMessages from './useMessages';
import { BROWSERS } from 'lib/constants';
import useLocale from './useLocale';
import useCountryNames from './useCountryNames';
import regions from 'public/iso-3166-2.json';

export function useFormat() {
  const { formatMessage, labels } = useMessages();
  const { locale } = useLocale();
  const countryNames = useCountryNames(locale);

  const formatBrowser = value => {
    return BROWSERS[value] || value;
  };

  const formatCountry = value => {
    return countryNames[value] || value;
  };

  const formatRegion = value => {
    return regions[value] ? regions[value] : value;
  };

  const formatDevice = value => {
    return formatMessage(labels[value] || labels.unknown);
  };

  const formatValue = (value, type) => {
    switch (type) {
      case 'browser':
        return formatBrowser(value);
      case 'country':
        return formatCountry(value);
      case 'region':
        return formatRegion(value);
      case 'device':
        return formatDevice(value);
      default:
        return value;
    }
  };

  return { formatBrowser, formatCountry, formatRegion, formatDevice, formatValue };
}

export default useFormat;
