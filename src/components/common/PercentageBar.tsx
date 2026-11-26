import { Progress, Row, Text } from '@umami/react-zen';

export function PercentageBar({ value }: { value: number }) {
  return (
    <Row alignItems="center" gap="3" minWidth="0" width="100%">
      <Progress aria-hidden="true" className="min-w-0 flex-1" value={value} min={0} max={100} />
      <Text className="w-10 shrink-0 text-right tabular-nums">{`${Math.round(value)}%`}</Text>
    </Row>
  );
}
