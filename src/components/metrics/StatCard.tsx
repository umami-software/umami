'use client';
import { Column, Heading, Loading, Text } from '@umami/react-zen';
import { Panel } from '@/components/common/Panel';
import { SparkLine } from './SparkLine';

export function StatCard({
  label,
  value,
  isLoading,
  sparkData,
}: {
  label: string;
  value: string | number;
  isLoading?: boolean;
  sparkData?: number[];
}) {
  return (
    <Panel>
      <Column gap="2" alignItems="center" paddingY="2">
        <Text size="sm" color="muted">
          {label}
        </Text>
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <Heading size="xl">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Heading>
            {sparkData && sparkData.length > 1 && <SparkLine data={sparkData} />}
          </>
        )}
      </Column>
    </Panel>
  );
}
