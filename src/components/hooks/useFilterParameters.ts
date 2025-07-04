import { useMemo } from 'react';
import { useNavigation } from './useNavigation';

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
    },
  } = useNavigation();

  return useMemo(() => {
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
  ]);
}
