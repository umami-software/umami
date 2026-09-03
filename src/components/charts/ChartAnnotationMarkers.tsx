import { IconLabel } from '@/components/common/IconLabel';
import { useLocale, useMessages } from '@/components/hooks';
import { Maximize } from '@/components/icons';
import { getThemeColors } from '@/lib/colors';
import { formatDate } from '@/lib/date';
import { Button, Column, Text, Tooltip, TooltipTrigger, useTheme } from '@umami/react-zen';
import { isSameDay } from 'date-fns';
import { useMemo } from 'react';
import styles from './ChartAnnotationMarkers.module.css';

const MAX_TOOLTIP_ANNOTATIONS = 3;

export interface ChartAnnotation {
  id: string;
  date: Date;
  markerDate?: Date;
  label: string;
  allDay?: boolean;
  isClickable?: boolean;
  isGroupClickable?: boolean;
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
  onMoreClick,
}: {
  markers: AnnotationMarker[];
  onClick?: (annotations: ChartAnnotation[]) => void;
  onMoreClick?: (annotations: ChartAnnotation[]) => void;
}) {
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { t, labels } = useMessages();
  const { colors } = useMemo(() => getThemeColors(theme), [theme]);

  return (
    <>
      {markers.map(({ annotations, x, y }) => {
        const [first] = annotations;
        const hasOneDate = annotations.every(annotation => isSameDay(annotation.date, first.date));
        const isClickable =
          !!onClick &&
          (hasOneDate
            ? first.isClickable !== false
            : annotations.every(annotation => annotation.isGroupClickable === true));
        const visibleAnnotations = annotations.slice(0, MAX_TOOLTIP_ANNOTATIONS);

        return (
          <TooltipTrigger key={first.id} delay={0}>
            <button
              type="button"
              className={styles.marker}
              style={{
                left: x,
                top: y,
                cursor: isClickable ? 'pointer' : 'default',
                backgroundColor: colors.chart.views.hoverBorderColor,
              }}
              aria-label={annotations.map(({ label }) => label).join(', ')}
              onClick={isClickable ? () => onClick?.(annotations) : undefined}
            >
              {annotations.length > 1 && <span className={styles.count}>{annotations.length}</span>}
            </button>
            <Tooltip placement="top">
              <Column
                gap="3"
                padding="1"
                borderRadius="md"
                className={styles.note}
                style={{ backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' }}
              >
                {visibleAnnotations.map(annotation => (
                  <Column key={annotation.id} gap="1">
                    <Text size="sm" weight="bold">
                      {formatAnnotationDate(annotation, locale)}
                    </Text>
                    <Text
                      size="sm"
                      className={annotations.length === 1 ? styles.noteFull : styles.noteText}
                    >
                      {annotation.label}
                    </Text>
                  </Column>
                ))}
                {annotations.length > 1 &&
                  (onMoreClick ? (
                    <Button
                      variant="quiet"
                      className={styles.moreButton}
                      onPress={() => onMoreClick(annotations)}
                    >
                      <IconLabel icon={<Maximize />}>{t(labels.view)}</IconLabel>
                    </Button>
                  ) : (
                    <IconLabel icon={<Maximize />} style={{ opacity: 0.8 }}>
                      {t(labels.view)}
                    </IconLabel>
                  ))}
              </Column>
            </Tooltip>
          </TooltipTrigger>
        );
      })}
    </>
  );
}
