import useCountryNames from './useCountryNames';
import regions from '../../../public/iso-3166-2.json';

export function useRegionNames(locale: string) {
  const { countryNames } = useCountryNames(locale);

  const getRegionName = (regionCode: string, countryCode?: string) => {
    if (!countryCode) {
      return regions[regionCode];
    }

    const region = regionCode.includes('-') ? regionCode : `${countryCode}-${regionCode}`;
    return regions[region] ? `${regions[region]}, ${countryNames[countryCode]}` : region;
  };

  return { regionNames: regions, getRegionName };
}

export default useRegionNames;
