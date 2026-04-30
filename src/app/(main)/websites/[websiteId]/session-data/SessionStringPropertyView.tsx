'use client';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useSessionDataStatsQuery } from '@/components/hooks';
import type { PropertyFilter } from '@/lib/types';
import { PropertyChart } from '@/components/property-data/PropertyChart';
import { HighCardinalityPropertyChart } from './HighCardinalityPropertyChart';

const HIGH_CARDINALITY_NAME_PATTERN =
  /(email|e-mail|name|(^|_)(id|uuid|token)($|_)|distinct_id|user_id|customer_id|client_id|member_id)/i;

function isHighCardinalityProperty(propertyName: string, totalValues: number, uniqueValues: number) {
  if (!totalValues) return false;

  const uniquenessRate = uniqueValues / totalValues;
  const hasHighCardinalityName = HIGH_CARDINALITY_NAME_PATTERN.test(propertyName);

  return totalValues >= 20 && (hasHighCardinalityName || uniqueValues >= 20 || uniquenessRate >= 0.6);
}

export function SessionStringPropertyView({
  websiteId,
  propertyName,
  propertyFilters = [],
}: {
  websiteId: string;
  propertyName: string;
  propertyFilters?: PropertyFilter[];
}) {
  const statsQuery = useSessionDataStatsQuery(websiteId, propertyName, propertyFilters);
  const rows = statsQuery.data ?? [];
  const totalValues = rows.reduce((sum, row) => sum + row.sessions, 0);
  const uniqueValues = rows.length;
  const isHighCardinality = isHighCardinalityProperty(
    propertyName,
    totalValues,
    uniqueValues,
  );

  return (
    <LoadingPanel isLoading={statsQuery.isLoading} error={statsQuery.error} minHeight="300px">
      {isHighCardinality ? (
        <HighCardinalityPropertyChart rows={rows} />
      ) : (
        <PropertyChart
          source="session"
          websiteId={websiteId}
          propertyName={propertyName}
          propertyFilters={propertyFilters}
        />
      )}
    </LoadingPanel>
  );
}
