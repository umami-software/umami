export interface AnalyticsParameters {
  websiteId: string;
  startDate?: Date | string;
  endDate?: Date | string;
  startAt?: number;
  endAt?: number;
  unit?: string;
  timezone?: string;
}

/** Encode structured GET criteria once, before URLSearchParams escapes them. */
export function serializeAnalyticsQuery(params: Record<string, any>) {
  const { websiteId: _websiteId, id: _id, startDate, endDate, ...query } = params;
  if (startDate != null) query.startAt = +new Date(startDate);
  if (endDate != null) query.endAt = +new Date(endDate);
  return Object.fromEntries(
    Object.entries(query)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [
        key,
        typeof value === 'object' && value !== null ? JSON.stringify(value) : value,
      ]),
  );
}
