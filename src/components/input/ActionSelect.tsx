import { ListItem, Select } from '@umami/react-zen';
import { useFlag, useMessages } from '@/components/hooks';

export interface ActionSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  /** Offer "Completed order" (a commerce payment) as an action. */
  allowOrder?: boolean;
}

export function ActionSelect({ value = 'path', onChange, allowOrder }: ActionSelectProps) {
  const { t, labels } = useMessages();
  const commerceEnabled = useFlag('commerce');
  // Keep an already saved order action selectable while the commerce flag is off.
  const showOrder = allowOrder && (commerceEnabled || value === 'order');

  return (
    <Select value={value} onChange={val => onChange?.(val as string)}>
      <ListItem id="path">{t(labels.viewedPage)}</ListItem>
      <ListItem id="event">{t(labels.triggeredEvent)}</ListItem>
      {showOrder && <ListItem id="order">{t('commerce.completedOrder')}</ListItem>}
    </Select>
  );
}
