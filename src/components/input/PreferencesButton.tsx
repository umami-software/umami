import {
  Button,
  Column,
  Icon,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@umami/react-zen';
import { DateRangeSetting } from '@/app/(main)/settings/preferences/DateRangeSetting';
import { TimeFormatSetting } from '@/app/(main)/settings/preferences/TimeFormatSetting';
import { TimezoneSetting } from '@/app/(main)/settings/preferences/TimezoneSetting';
import { useMessages } from '@/components/hooks';
import { Settings } from '@/components/icons';

export function PreferencesButton() {
  const { t, labels } = useMessages();

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="ghost" aria-label={t(labels.preferences)} />}>
        <Icon>
          <Settings />
        </Icon>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        aria-label={t(labels.preferences)}
        style={{ width: 'auto' }}
      >
        <Column gap="3">
          <Column gap="2">
            <Label>{t(labels.timezone)}</Label>
            <TimezoneSetting />
          </Column>
          <Column gap="2">
            <Label>{t(labels.timeFormat)}</Label>
            <TimeFormatSetting />
          </Column>
          <Column gap="2">
            <Label>{t(labels.defaultDateRange)}</Label>
            <DateRangeSetting />
          </Column>
        </Column>
      </PopoverContent>
    </Popover>
  );
}
