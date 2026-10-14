import { Box, Column, Row, Text, useTheme } from '@umami/react-zen';
import { colord } from 'colord';
import {
  type GeoPermissibleObjects,
  geoArea,
  geoCentroid,
  geoContains,
  geoDistance,
  geoGraticule10,
  geoOrthographic,
  geoPath,
} from 'd3-geo';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useCountryNames, useLocale, useMessages } from '@/components/hooks';
import { getThemeColors } from '@/lib/colors';
import { ISO_COUNTRIES, MAP_FILE } from '@/lib/constants';
import { formatLongNumber } from '@/lib/format';

const HEIGHT = 420;
const ROTATION_SPEED = 0.06; // degrees per frame
const PULSE_DURATION = 2000;

interface Feature {
  id: string;
  type: 'Feature';
  geometry: any;
  properties: { name: string };
}

interface Marker {
  code: string;
  count: number;
  coordinates: [number, number];
}

let worldCache: Promise<Feature[]> | null = null;

function loadWorld(): Promise<Feature[]> {
  if (!worldCache) {
    worldCache = fetch(`${process.env.basePath || ''}${MAP_FILE}`)
      .then(res => res.json())
      .then(json => json.features.filter((f: Feature) => f.id !== 'ATA'))
      .catch(() => {
        worldCache = null;
        return [];
      });
  }
  return worldCache;
}

// Centroid of the largest polygon, so countries with overseas territories
// (e.g. France, USA) get a marker on their mainland.
function getMainlandCentroid(feature: Feature): [number, number] {
  const { geometry } = feature;

  if (geometry.type !== 'MultiPolygon') {
    return geoCentroid(feature as GeoPermissibleObjects);
  }

  let largest = geometry.coordinates[0];
  let maxArea = 0;

  for (const coordinates of geometry.coordinates) {
    const area = geoArea({ type: 'Polygon', coordinates });
    if (area > maxArea) {
      maxArea = area;
      largest = coordinates;
    }
  }

  return geoCentroid({ type: 'Polygon', coordinates: largest });
}

export interface RealtimeGlobeProps {
  data: {
    countries: Record<string, number>;
    totals: { visitors: number };
  };
  live?: boolean;
}

export function RealtimeGlobe({ data, live = true }: RealtimeGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { t, labels } = useMessages();
  const { countryNames } = useCountryNames(locale);
  const visitorsLabel = t(labels.visitors).toLocaleLowerCase(locale);

  // Mutable state for the animation loop, so React re-renders don't restart it.
  const state = useRef({
    rotation: [-20, -20] as [number, number],
    dragging: false,
    lastPointer: null as [number, number] | null,
    resumeAt: 0,
    hovered: null as string | null,
  });

  useEffect(() => {
    loadWorld().then(setFeatures);
  }, []);

  const centroids = useMemo(() => {
    const map: Record<string, [number, number]> = {};
    for (const feature of features) {
      const code = ISO_COUNTRIES[feature.id];
      if (code) map[code] = getMainlandCentroid(feature);
    }
    return map;
  }, [features]);

  const markers: Marker[] = useMemo(
    () =>
      Object.entries(data?.countries || {})
        .filter(([code]) => centroids[code])
        .map(([code, count]) => ({ code, count, coordinates: centroids[code] }))
        .sort((a, b) => b.count - a.count),
    [data, centroids],
  );

  const counts = useMemo(() => data?.countries || {}, [data]);
  const maxCount = Math.max(1, ...markers.map(m => m.count));

  // Keep the latest render inputs in a ref read by the animation loop.
  const renderInputs = useRef({ features, markers, counts, maxCount, theme });
  renderInputs.current = { features, markers, counts, maxCount, theme };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const projection = geoOrthographic().clipAngle(90).precision(0.5);
    const path = geoPath(projection, ctx);
    const graticule = geoGraticule10();
    let width = 0;
    let frame = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = container.clientWidth;
      canvas.width = width * dpr;
      canvas.height = HEIGHT * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${HEIGHT}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      const { features, markers, counts, maxCount, theme } = renderInputs.current;
      const { colors } = getThemeColors(theme);
      const primary = colord(colors.map.baseColor);
      const isDark = theme === 'dark';
      const s = state.current;

      if (!s.dragging && !reduceMotion && now > s.resumeAt) {
        s.rotation[0] += ROTATION_SPEED;
      }

      const radius = Math.min(width, HEIGHT) / 2 - 24;
      const cx = width / 2;
      const cy = HEIGHT / 2;
      projection.scale(radius).translate([cx, cy]).rotate(s.rotation);

      ctx.clearRect(0, 0, width, HEIGHT);

      // Atmosphere glow
      const glow = ctx.createRadialGradient(cx, cy, radius * 0.9, cx, cy, radius * 1.15);
      glow.addColorStop(0, primary.alpha(isDark ? 0.35 : 0.2).toRgbString());
      glow.addColorStop(1, primary.alpha(0).toRgbString());
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // Ocean
      const ocean = ctx.createRadialGradient(
        cx - radius * 0.35,
        cy - radius * 0.35,
        radius * 0.1,
        cx,
        cy,
        radius,
      );
      ocean.addColorStop(0, isDark ? '#1d2735' : '#ffffff');
      ocean.addColorStop(1, isDark ? '#0d1117' : '#e6eef8');
      ctx.fillStyle = ocean;
      ctx.beginPath();
      path({ type: 'Sphere' });
      ctx.fill();

      // Graticule
      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle = primary.alpha(isDark ? 0.08 : 0.1).toRgbString();
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Countries
      for (const feature of features) {
        const code = ISO_COUNTRIES[feature.id];
        const count = counts[code];
        ctx.beginPath();
        path(feature as GeoPermissibleObjects);

        if (count) {
          ctx.fillStyle = primary.alpha(0.35 + 0.5 * (count / maxCount)).toRgbString();
        } else {
          ctx.fillStyle = isDark ? '#2b2f36' : '#d5dbe3';
        }
        if (s.hovered === code) {
          ctx.fillStyle = primary.alpha(0.95).toRgbString();
        }
        ctx.fill();
        ctx.strokeStyle = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Live visitor markers
      const center: [number, number] = [-s.rotation[0], -s.rotation[1]];

      markers.forEach((marker, index) => {
        const distance = geoDistance(marker.coordinates, center);
        if (distance > Math.PI / 2) return;

        const point = projection(marker.coordinates);
        if (!point) return;

        // Fade markers out as they approach the horizon
        const edgeFade = Math.min(1, (Math.PI / 2 - distance) / 0.25);
        const size = 3 + 5 * Math.sqrt(marker.count / maxCount);
        const pulseCount = Math.min(3, marker.count);

        for (let i = 0; i < pulseCount; i++) {
          const phase =
            ((now + index * 377 + (i * PULSE_DURATION) / pulseCount) % PULSE_DURATION) /
            PULSE_DURATION;
          ctx.beginPath();
          ctx.arc(point[0], point[1], size + phase * size * 3, 0, Math.PI * 2);
          ctx.strokeStyle = primary.alpha((1 - phase) * 0.7 * edgeFade).toRgbString();
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(point[0], point[1], size, 0, Math.PI * 2);
        ctx.fillStyle = primary.alpha(edgeFade).toRgbString();
        ctx.shadowColor = primary.toRgbString();
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(point[0], point[1], size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${edgeFade})`;
        ctx.fill();
      });

      frame = requestAnimationFrame(draw);
    };

    const getPointer = (e: PointerEvent): [number, number] => {
      const rect = canvas.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    };

    const onPointerDown = (e: PointerEvent) => {
      state.current.dragging = true;
      state.current.lastPointer = getPointer(e);
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
    };

    const onPointerMove = (e: PointerEvent) => {
      const s = state.current;
      const pointer = getPointer(e);

      if (s.dragging && s.lastPointer) {
        const k = 75 / projection.scale();
        s.rotation[0] += (pointer[0] - s.lastPointer[0]) * k;
        s.rotation[1] = Math.max(
          -80,
          Math.min(80, s.rotation[1] - (pointer[1] - s.lastPointer[1]) * k),
        );
        s.lastPointer = pointer;
        setTooltip(null);
        return;
      }

      const coords = projection.invert(pointer);
      const center: [number, number] = [-s.rotation[0], -s.rotation[1]];
      const feature =
        coords && geoDistance(coords, center) < Math.PI / 2
          ? renderInputs.current.features.find(f => geoContains(f as GeoPermissibleObjects, coords))
          : null;
      const code = feature ? ISO_COUNTRIES[feature.id] : null;
      s.hovered = code;

      if (code) {
        const count = renderInputs.current.counts[code] || 0;
        setTooltip({
          x: pointer[0],
          y: pointer[1],
          text: `${countryNames[code] || feature.properties.name}: ${formatLongNumber(count)} ${visitorsLabel}`,
        });
      } else {
        setTooltip(null);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      state.current.dragging = false;
      state.current.lastPointer = null;
      state.current.resumeAt = performance.now() + 1500;
      canvas.releasePointerCapture(e.pointerId);
      canvas.style.cursor = 'grab';
    };

    const onPointerLeave = () => {
      state.current.hovered = null;
      setTooltip(null);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerLeave);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [countryNames, visitorsLabel]);

  const topCountries = markers.slice(0, 5);

  return (
    <Box ref={containerRef} position="relative" style={{ height: HEIGHT, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', cursor: 'grab', touchAction: 'none' }} />
      <Column position="absolute" top="0" left="0" gap="2" style={{ pointerEvents: 'none' }}>
        <Row alignItems="center" gap="2">
          {live && (
            <Box
              className="realtime-globe-dot"
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#44b556',
                boxShadow: '0 0 0 0 rgba(68,181,86,0.6)',
                animation: 'realtime-globe-pulse 1.6s infinite',
              }}
            />
          )}
          <Text weight="bold" size="lg">
            {formatLongNumber(data?.totals?.visitors || 0)}
          </Text>
          <Text color="muted">{visitorsLabel}</Text>
        </Row>
        {topCountries.map(({ code, count }) => (
          <Row key={code} gap="2" alignItems="center">
            <Text size="sm" color="muted" style={{ minWidth: 24 }}>
              {formatLongNumber(count)}
            </Text>
            <Text size="sm">{countryNames[code] || code}</Text>
          </Row>
        ))}
      </Column>
      {tooltip && (
        <Box
          position="absolute"
          padding="2"
          borderRadius="md"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y + 12,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            fontSize: 13,
          }}
        >
          {tooltip.text}
        </Box>
      )}
      <style>{`@keyframes realtime-globe-pulse {
        0% { box-shadow: 0 0 0 0 rgba(68,181,86,0.6); }
        70% { box-shadow: 0 0 0 8px rgba(68,181,86,0); }
        100% { box-shadow: 0 0 0 0 rgba(68,181,86,0); }
      }`}</style>
    </Box>
  );
}
