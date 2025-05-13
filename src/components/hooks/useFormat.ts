import useMessages from './useMessages';
import { BROWSERS, OS_NAMES } from '@/lib/constants';
import useLocale from './useLocale';
import useCountryNames from './useCountryNames';
import useLanguageNames from './useLanguageNames';
import regions from '../../../public/iso-3166-2.json';

export function useFormat() {
  const { formatMessage, labels } = useMessages();
  const { locale } = useLocale();
  const { countryNames } = useCountryNames(locale);
  const { languageNames } = useLanguageNames(locale);

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
    return countryNames[value] || value;
  };

  const formatRegion = (value?: string): string => {
    const [country] = value?.split('-') || [];
    return regions[value] ? `${regions[value]}, ${countryNames[country]}` : value;
  };

  const formatCity = (value: string, country?: string): string => {
    return countryNames[country] ? `${value}, ${countryNames[country]}` : value;
  };

  const formatLanguage = (value: string): string => {
    return languageNames[value?.split('-')[0]] || value;
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
      case 'language':
        return formatLanguage(value);
      default:
        return value;
    }
  };

  return {
    formatOS,
    formatBrowser,
    formatDevice,
    formatCountry,
    formatRegion,
    formatCity,
    formatLanguage,
    formatValue,
  };
}

export default useFormat;
