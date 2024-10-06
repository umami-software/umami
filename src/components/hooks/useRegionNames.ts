import { useIntl } from 'react-intl';
import regions from '../../../public/iso-3166-2.json';

export function useRegionNames() {
  const intl = useIntl();

  const getRegionName = (regionCode: string, countryCode?: string) => {
    if (!countryCode) {
      return regions[regionCode];
    }

    const region = regionCode.includes('-') ? regionCode : `${countryCode}-${regionCode}`;
    return regions[region]
      ? `${regions[region]}, ${intl.formatDisplayName(countryCode, { type: 'region' })}`
      : region;
  };

  return { regionNames: regions, getRegionName };
}

export default useRegionNames;
