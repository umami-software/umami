import useMessages from './useMessages';
import { BROWSERS } from 'lib/constants';
import useLocale from './useLocale';
import useCountryNames from './useCountryNames';

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

  const formatDevice = value => {
    return formatMessage(labels[value] || labels.unknown);
  };

  const formatValue = (value, type) => {
    switch (type) {
      case 'browser':
        return formatBrowser(value);
      case 'country':
        return formatCountry(value);
      case 'device':
        return formatDevice(value);
      default:
        return value;
    }
  };

  return { formatBrowser, formatCountry, formatDevice, formatValue };
}

export default useFormat;
