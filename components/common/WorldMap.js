import React, { useState, useMemo } from 'react';
import ReactTooltip from 'react-tooltip';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import classNames from 'classnames';
import tinycolor from 'tinycolor2';
import useTheme from 'hooks/useTheme';
import { THEME_COLORS } from 'lib/constants';
import styles from './WorldMap.module.css';

const geoUrl = '/world-110m.json';

export default function WorldMap({ data, className }) {
  const [tooltip, setTooltip] = useState();
  const [theme] = useTheme();
  const colors = useMemo(
    () => ({
      baseColor: THEME_COLORS[theme].primary,
      fillColor: THEME_COLORS[theme].gray100,
      strokeColor: THEME_COLORS[theme].primary,
      hoverColor: THEME_COLORS[theme].primary,
    }),
    [theme],
  );

  function getFillColor(code) {
    if (code === 'AQ') return;
    const country = data?.find(({ x }) => x === code);

    if (!country) {
      return colors.fillColor;
    }

    return tinycolor(colors.baseColor)[theme === 'light' ? 'lighten' : 'darken'](
      40 * (1.0 - country.z / 100),
    );
  }

  function getOpacity(code) {
    return code === 'AQ' ? 0 : 1;
  }

  function handleHover({ ISO_A2: code, NAME: name }) {
    if (code === 'AQ') return;
    const country = data?.find(({ x }) => x === code);
    setTooltip(`${name}: ${country?.y || 0} visitors`);
  }

  return (
    <div
      className={classNames(styles.container, className)}
      data-tip=""
      data-for="world-map-tooltip"
    >
      <ComposableMap projection="geoMercator">
        <ZoomableGroup zoom={0.8} minZoom={0.7} center={[0, 40]}>
          <Geographies geography={geoUrl}>
            {({ geographies }) => {
              return geographies.map(geo => {
                const code = geo.properties.ISO_A2;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getFillColor(code)}
                    stroke={colors.strokeColor}
                    opacity={getOpacity(code)}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fill: colors.hoverColor },
                      pressed: { outline: 'none' },
                    }}
                    onMouseOver={() => handleHover(geo.properties)}
                    onMouseOut={() => setTooltip(null)}
                  />
                );
              });
            }}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      <ReactTooltip id="world-map-tooltip">{tooltip}</ReactTooltip>
    </div>
  );
}
