import { useMemo } from 'react';
import { useNavigation } from './useNavigation';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function useFilterParameters() {
  const {
    query: {
      path,
      referrer,
      title,
      query,
      host,
      os,
      browser,
      device,
      country,
      region,
      city,
      event,
      tag,
      hostname,
      page,
      pageSize,
      search,
      segment,
      cohort,
    },
  } = useNavigation();

  return useMemo(() => {
    const validSegment = segment && UUID_REGEX.test(segment) ? segment : undefined;
    const validCohort = cohort && UUID_REGEX.test(cohort) ? cohort : undefined;

    return {
      path,
      referrer,
      title,
      query,
      host,
      os,
      browser,
      device,
      country,
      region,
      city,
      event,
      tag,
      hostname,
      search,
      segment: validSegment,
      cohort: validCohort,
    };
  }, [
    path,
    referrer,
    title,
    query,
    host,
    os,
    browser,
    device,
    country,
    region,
    city,
    event,
    tag,
    hostname,
    page,
    pageSize,
    search,
    segment,
    cohort,
  ]);
}
