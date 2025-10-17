import { FloatingTooltip, Column, useTheme, ColumnProps } from '@umami/react-zen';
import { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { colord } from 'colord';
import { ISO_COUNTRIES, MAP_FILE } from '@/lib/constants';
import {
  useWebsiteMetricsQuery,
  useCountryNames,
  useLocale,
  useMessages,
} from '@/components/hooks';
import { formatLongNumber } from '@/lib/format';
import { percentFilter } from '@/lib/filters';
import { getThemeColors } from '@/lib/colors';

export interface WorldMapProps extends ColumnProps {
  websiteId?: string;
  data?: any[];
}

export function WorldMap({ websiteId, data, ...props }: WorldMapProps) {
  const [tooltip, setTooltipPopup] = useState();
  const { theme } = useTheme();
  const { colors } = getThemeColors(theme);
  const { locale } = useLocale();
  const { formatMessage, labels } = useMessages();
  const { countryNames } = useCountryNames(locale);
  const visitorsLabel = formatMessage(labels.visitors).toLocaleLowerCase(locale);
  const unknownLabel = formatMessage(labels.unknown);

  const { data: mapData } = useWebsiteMetricsQuery(websiteId, {
    type: 'country',
  });

  const metrics = useMemo(
    () => (data || mapData ? percentFilter((data || mapData) as any[]) : []),
    [data, mapData],
  );

  const getFillColor = (code: string) => {
    if (code === 'AQ') return;
    const country = metrics?.find(({ x }) => x === code);

    if (!country) {
      return colors.map.fillColor;
    }

    return colord(colors.map.baseColor)
      [theme === 'light' ? 'lighten' : 'darken'](0.4 * (1.0 - country.z / 100))
      .toHex();
  };

  const getOpacity = (code: string) => {
    return code === 'AQ' ? 0 : 1;
  };

  const handleHover = (code: string) => {
    if (code === 'AQ') return;
    const country = metrics?.find(({ x }) => x === code);
    setTooltipPopup(
      `${countryNames[code] || unknownLabel}: ${formatLongNumber(
        country?.y || 0,
      )} ${visitorsLabel}` as any,
    );
  };

  return (
    <Column
      {...props}
      data-tip=""
      data-for="world-map-tooltip"
      style={{ margin: 'auto 0', overflow: 'hidden' }}
    >
      <ComposableMap projection="geoMercator">
        <ZoomableGroup zoom={0.8} minZoom={0.7} center={[0, 40]}>
          <Geographies geography={`${process.env.basePath || ''}${MAP_FILE}`}>
            {({ geographies }) => {
              return geographies.map(geo => {
                const code = ISO_COUNTRIES[geo.id];

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getFillColor(code)}
                    stroke={colors.map.strokeColor}
                    opacity={getOpacity(code)}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fill: colors.map.hoverColor },
                      pressed: { outline: 'none' },
                    }}
                    onMouseOver={() => handleHover(code)}
                    onMouseOut={() => setTooltipPopup(null)}
                  />
                );
              });
            }}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      {tooltip && <FloatingTooltip>{tooltip}</FloatingTooltip>}
    </Column>
  );
}
