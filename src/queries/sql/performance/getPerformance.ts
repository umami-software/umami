import type { QueryFilters } from '@/lib/types';
import { getPerformanceChart } from './getPerformanceChart';
import { getPerformanceStats } from './getPerformanceStats';

export interface PerformanceParameters {
  startDate: Date;
  endDate: Date;
  unit: string;
  timezone: string;
  metric: string;
}

export interface PerformanceResult {
  chart: { t: string; p50: number; p75: number; p95: number }[];
  summary: {
    lcp: { p50: number; p75: number; p95: number };
    inp: { p50: number; p75: number; p95: number };
    cls: { p50: number; p75: number; p95: number };
    fcp: { p50: number; p75: number; p95: number };
    ttfb: { p50: number; p75: number; p95: number };
    count: number;
  };
}

// Compatibility composition for the legacy report endpoint.
export async function getPerformance(
  ...args: [websiteId: string, parameters: PerformanceParameters, filters: QueryFilters]
): Promise<PerformanceResult> {
  const [{ chart }, summary] = await Promise.all([
    getPerformanceChart(...args),
    getPerformanceStats(...args),
  ]);
  return { chart, summary };
}
