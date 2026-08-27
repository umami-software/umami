import { Column, Text, Tooltip, TooltipTrigger, useTheme } from '@umami/react-zen';
import { useMemo } from 'react';
import { useLocale } from '@/components/hooks';
import { getThemeColors } from '@/lib/colors';
import { formatDate } from '@/lib/date';
import styles from './ChartAnnotationMarkers.module.css';

export interface ChartAnnotation {
  id: string;
  date: Date;
  label: string;
  allDay?: boolean;
}

export interface AnnotationMarker {
  annotations: ChartAnnotation[];
  x: number;
  y: number;
}

export function formatAnnotationDate(annotation: ChartAnnotation, locale: string) {
  return formatDate(annotation.date, annotation.allDay === false ? 'PP p' : 'PP', locale);
}

export function ChartAnnotationMarkers({
  markers,
  onClick,
}: {
  markers: AnnotationMarker[];
  onClick?: (annotation: ChartAnnotation) => void;
}) {
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { colors } = useMemo(() => getThemeColors(theme), [theme]);

  return (
    <>
      {markers.map(({ annotations, x, y }) => {
        const [first] = annotations;

        return (
          <TooltipTrigger key={first.id} delay={0}>
            <button
              type="button"
              className={styles.marker}
              style={{ left: x, top: y, backgroundColor: colors.chart.views.hoverBorderColor }}
              aria-label={annotations.map(({ label }) => label).join(', ')}
              onClick={() => onClick?.(first)}
            >
              {annotations.length > 1 && <span className={styles.count}>{annotations.length}</span>}
            </button>
            <Tooltip placement="top">
              <Column gap="3" className={styles.note}>
                {annotations.map(annotation => (
                  <Column key={annotation.id} gap="1">
                    <Text size="sm" weight="bold">
                      {formatAnnotationDate(annotation, locale)}
                    </Text>
                    <Text size="sm">{annotation.label}</Text>
                  </Column>
                ))}
              </Column>
            </Tooltip>
          </TooltipTrigger>
        );
      })}
    </>
  );
}
