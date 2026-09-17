import { endOfDay, endOfHour, startOfDay, startOfHour } from 'date-fns';

export interface AnnotationRange {
  startAt: number;
  endAt: number;
}

/**
 * Returns the `date` URL parameter value that filters the website view
 * to the day (all-day annotation) or hour (timed annotation) of an annotation.
 */
export function getAnnotationDateRangeValue(date: Date, allDay: boolean) {
  const [startDate, endDate] = allDay
    ? [startOfDay(date), endOfDay(date)]
    : [startOfHour(date), endOfHour(date)];

  return `range:${startDate.getTime()}:${endDate.getTime()}`;
}
