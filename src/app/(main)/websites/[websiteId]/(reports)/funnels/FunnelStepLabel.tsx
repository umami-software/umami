import { Icon, Row, Text } from '@umami/react-zen';
import { File } from '@/components/icons';
import { Lightning } from '@/components/svg';

export function FunnelStepLabel({
  index,
  type,
  value,
}: {
  index: number;
  type: string;
  value: string;
}) {
  return (
    <Row alignItems="center" gap minWidth="0">
      <Text weight="bold" color="muted-foreground">
        {index + 1}
      </Text>
      <Icon>{type === 'path' ? <File /> : <Lightning />}</Icon>
      <Text truncate title={value}>
        {value}
      </Text>
    </Row>
  );
}
