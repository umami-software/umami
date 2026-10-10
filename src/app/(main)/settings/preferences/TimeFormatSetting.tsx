import { Button, ListItem, Row, Select } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { DEFAULT_TIME_FORMAT, TIME_FORMAT_CONFIG, TIME_FORMATS } from '@/lib/constants';
import { setItem } from '@/lib/storage';
import { setTimeFormat, useApp } from '@/store/app';

const selector = (state: { timeFormat: string }) => state.timeFormat;

export function TimeFormatSetting() {
  const { t, labels } = useMessages();
  const timeFormat = useApp(selector);

  const saveTimeFormat = (value: string) => {
    setItem(TIME_FORMAT_CONFIG, value);
    setTimeFormat(value);
  };

  return (
    <Row gap>
      <Select
        value={timeFormat}
        onChange={val => saveTimeFormat(val as string)}
        buttonProps={{ style: { minWidth: '250px' } }}
      >
        <ListItem id={TIME_FORMATS.auto}>{t(labels.languageDefault)}</ListItem>
        <ListItem id={TIME_FORMATS.h12}>{t(labels.format12Hour)}</ListItem>
        <ListItem id={TIME_FORMATS.h24}>{t(labels.format24Hour)}</ListItem>
      </Select>
      <Button onPress={() => saveTimeFormat(DEFAULT_TIME_FORMAT)}>{t(labels.reset)}</Button>
    </Row>
  );
}
