import {
  Button,
  Row,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { DEFAULT_TIME_FORMAT, TIME_FORMAT_CONFIG, TIME_FORMATS } from '@/lib/constants';
import { setItem } from '@/lib/storage';
import { setTimeFormat, useApp } from '@/store/app';

const selector = (state: { timeFormat: string }) => state.timeFormat;

export function TimeFormatSetting() {
  const { t, labels } = useMessages();
  const timeFormat = useApp(selector);

  const items = [
    { value: TIME_FORMATS.auto, label: t(labels.languageDefault) },
    { value: TIME_FORMATS.h12, label: t(labels.format12Hour) },
    { value: TIME_FORMATS.h24, label: t(labels.format24Hour) },
  ];

  const saveTimeFormat = (value: string) => {
    setItem(TIME_FORMAT_CONFIG, value);
    setTimeFormat(value);
  };

  return (
    <Row gap wrap="wrap">
      <Select items={items} value={timeFormat} onValueChange={val => saveTimeFormat(val as string)}>
        <SelectTrigger style={{ minWidth: '250px' }}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectGroup>
            {items.map(item => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={() => saveTimeFormat(DEFAULT_TIME_FORMAT)}>
        {t(labels.reset)}
      </Button>
    </Row>
  );
}
