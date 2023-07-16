import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import classNames from 'classnames';
import { colord } from 'colord';
import HoverTooltip from 'components/common/HoverTooltip';
import { ISO_COUNTRIES, MAP_FILE } from 'lib/constants';
import useTheme from 'hooks/useTheme';
import useCountryNames from 'hooks/useCountryNames';
import useLocale from 'hooks/useLocale';
import { formatLongNumber } from 'lib/format';
import { percentFilter } from 'lib/filters';
import styles from './WorldMap.module.css';

export function WorldMap({ data, className }) {
  const { basePath } = useRouter();
  const [tooltip, setTooltipPopup] = useState();
  const { theme, colors } = useTheme();
  const { locale } = useLocale();
  const countryNames = useCountryNames(locale);
  const metrics = useMemo(() => (data ? percentFilter(data) : []), [data]);

  function getFillColor(code) {
    if (code === 'AQ') return;
    const country = metrics?.find(({ x }) => x === code);

    if (!country) {
      return colors.map.fillColor;
    }

    return colord(colors.map.baseColor)
      [theme === 'light' ? 'lighten' : 'darken'](0.4 * (1.0 - country.z / 100))
      .toHex();
  }

  function getOpacity(code) {
    return code === 'AQ' ? 0 : 1;
  }

  function handleHover(code) {
    if (code === 'AQ') return;
    const country = metrics?.find(({ x }) => x === code);
    setTooltipPopup(`${countryNames[code]}: ${formatLongNumber(country?.y || 0)} visitors`);
  }

  return (
    <div
      className={classNames(styles.container, className)}
      data-tip=""
      data-for="world-map-tooltip"
    >
      <ComposableMap projection="geoMercator">
        <ZoomableGroup zoom={0.8} minZoom={0.7} center={[0, 40]}>
          <Geographies geography={`${basePath}${MAP_FILE}`}>
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
      {tooltip && <HoverTooltip>{tooltip}</HoverTooltip>}
    </div>
  );
}

export default WorldMap;
