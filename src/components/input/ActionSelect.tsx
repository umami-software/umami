import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';

export interface ActionSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
}

export function ActionSelect({ value = 'path', onValueChange }: ActionSelectProps) {
  const { t, labels } = useMessages();
  const items = [
    { value: 'path', label: t(labels.viewedPage) },
    { value: 'event', label: t(labels.triggeredEvent) },
  ];

  return (
    <Select items={items} value={value} onValueChange={val => onValueChange?.(val as string)}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {items.map(item => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
