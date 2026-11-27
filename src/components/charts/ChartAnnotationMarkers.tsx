import { Button, Column, Text, Tooltip, TooltipContent, TooltipTrigger } from '@umami/react-zen';
import { isSameDay } from 'date-fns';
import { IconLabel } from '@/components/common/IconLabel';
import { useLocale, useMessages } from '@/components/hooks';
import { Maximize } from '@/components/icons';
import { formatDate } from '@/lib/date';
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
  const { locale } = useLocale();
  const { t, labels } = useMessages();

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
          <Tooltip key={first.id}>
            <TooltipTrigger
              delay={0}
              render={
                <button
                  type="button"
                  className={styles.marker}
                  style={{
                    left: x,
                    top: y,
                    cursor: isClickable ? 'pointer' : 'default',
                    backgroundColor: 'var(--success)',
                  }}
                  aria-label={annotations.map(({ label }) => label).join(', ')}
                  onClick={isClickable ? () => onClick?.(annotations) : undefined}
                />
              }
            >
              {annotations.length > 1 && <span className={styles.count}>{annotations.length}</span>}
            </TooltipTrigger>
            <TooltipContent side="top" className="tooltip-bare bg-transparent p-0">
              <Column
                gap="3"
                padding="1"
                borderRadius="md"
                className={styles.note}
                style={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  borderRadius: '5.25px',
                  color: 'white',
                  gap: '8px',
                  padding: '12px',
                }}
              >
                {visibleAnnotations.map(annotation => (
                  <Column key={annotation.id} gap="1">
                    <Text
                      size="sm"
                      weight="bold"
                      style={{ fontSize: '12.25px', lineHeight: '17.5px' }}
                    >
                      {formatAnnotationDate(annotation, locale)}
                    </Text>
                    <Text
                      size="sm"
                      className={annotations.length === 1 ? styles.noteFull : styles.noteText}
                      style={{ fontSize: '12.25px', lineHeight: '17.5px' }}
                    >
                      {annotation.label}
                    </Text>
                  </Column>
                ))}
                {onMoreClick && (
                  <Button
                    variant="ghost"
                    size="xs"
                    className={styles.moreButton}
                    onClick={() => onMoreClick(annotations)}
                  >
                    <IconLabel icon={<Maximize />}>{t(labels.view)}</IconLabel>
                  </Button>
                )}
              </Column>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </>
  );
}
