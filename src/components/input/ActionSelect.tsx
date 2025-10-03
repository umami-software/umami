import { Select, ListItem } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';

export interface ActionSelectProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function ActionSelect({ value = 'path', onChange }: ActionSelectProps) {
  const { formatMessage, labels } = useMessages();

  return (
    <Select value={value} onChange={onChange}>
      <ListItem id="path">{formatMessage(labels.viewedPage)}</ListItem>
      <ListItem id="event">{formatMessage(labels.triggeredEvent)}</ListItem>
    </Select>
  );
}
