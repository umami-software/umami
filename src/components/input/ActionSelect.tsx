import { ListItem, Select } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';

export interface ActionSelectProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function ActionSelect({ value = 'path', onChange }: ActionSelectProps) {
  const { t, labels } = useMessages();

  return (
    <Select value={value} onChange={onChange}>
      <ListItem id="path">{t(labels.viewedPage)}</ListItem>
      <ListItem id="event">{t(labels.triggeredEvent)}</ListItem>
    </Select>
  );
}
