import { ListItem, Select } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { formatShortTime } from '@/lib/format';

// Minimum visit durations offered, in seconds
export const VISIT_DURATION_OPTIONS = [10, 30, 60, 180, 600];

const ANY_DURATION = 'any';

export function VisitDurationFilter({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value?: string) => void;
}) {
  const { t, labels } = useMessages();

  return (
    <Select
      label={t(labels.visitDuration)}
      value={value || ANY_DURATION}
      onChange={selected => onChange(selected === ANY_DURATION ? undefined : String(selected))}
      buttonProps={{ style: { minWidth: 120 } }}
    >
      <ListItem id={ANY_DURATION}>{t(labels.all)}</ListItem>
      {VISIT_DURATION_OPTIONS.map(seconds => (
        <ListItem key={seconds} id={String(seconds)}>
          {`≥ ${formatShortTime(seconds, ['m', 's'], ' ').trim()}`}
        </ListItem>
      ))}
    </Select>
  );
}
