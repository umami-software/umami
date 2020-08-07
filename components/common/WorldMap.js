import React, { useState } from 'react';
import ReactTooltip from 'react-tooltip';
import classNames from 'classnames';
import tinycolor from 'tinycolor2';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import styles from './WorldMap.module.css';

const geoUrl = '/world-110m.json';

export default function WorldMap({
  data,
  className,
  baseColor = '#e9f3fd',
  fillColor = '#f5f5f5',
  strokeColor = '#2680eb',
  hoverColor = '#2680eb',
}) {
  const [tooltip, setTooltip] = useState();

  function getFillColor(code) {
    if (code === 'AQ') return '#ffffff';
    const country = data?.find(({ x }) => x === code);
    return country ? tinycolor(baseColor).darken(country.z) : fillColor;
  }

  function getStrokeColor(code) {
    return code === 'AQ' ? '#ffffff' : strokeColor;
  }

  function getHoverColor(code) {
    return code === 'AQ' ? '#ffffff' : hoverColor;
  }

  function handleHover({ ISO_A2: code, NAME: name }) {
    const country = data?.find(({ x }) => x === code);
    setTooltip(`${name}: ${country?.y || 0} visitors`);
  }

  return (
    <div className={classNames(styles.container, className)}>
      <ComposableMap data-tip="" projection="geoMercator">
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
                    stroke={getStrokeColor(code)}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fill: getHoverColor(code) },
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
      <ReactTooltip>{tooltip}</ReactTooltip>
    </div>
  );
}
