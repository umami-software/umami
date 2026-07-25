import type { BoardEntityType } from './boards';

export const BOARD_COMPONENT_COMPATIBILITY_MATRIX = {
  EventsMetricsBar: ['website'],
  EventsChart: ['website'],
  Funnel: ['website'],
  Goal: ['website'],
  RealtimeActiveUsers: ['website'],
  RealtimeHeader: ['website'],
  RealtimeChart: ['website'],
  RevenueMetricsBar: ['website'],
  RevenueChart: ['website'],
  RevenueMetricsTable: ['website'],
  UTM: ['website'],
  WeeklyTraffic: ['website'],
} as const satisfies Partial<Record<string, readonly BoardEntityType[]>>;

export function getSupportedBoardComponentEntityTypes(componentType: string) {
  return BOARD_COMPONENT_COMPATIBILITY_MATRIX[componentType];
}

export function isBoardComponentSupportedByEntityType(
  componentType: string,
  entityType?: BoardEntityType,
) {
  const supportedEntityTypes = getSupportedBoardComponentEntityTypes(componentType);

  if (!entityType || !supportedEntityTypes) {
    return true;
  }

  return supportedEntityTypes.includes(entityType);
}
