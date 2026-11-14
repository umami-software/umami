import { Button, Column, Dialog, DialogTrigger, Icon, Label, Popover } from '@umami/react-zen';
import { DateRangeSetting } from '@/app/(main)/settings/preferences/DateRangeSetting';
import { TimeFormatSetting } from '@/app/(main)/settings/preferences/TimeFormatSetting';
import { TimezoneSetting } from '@/app/(main)/settings/preferences/TimezoneSetting';
import { useMessages } from '@/components/hooks';
import { Settings } from '@/components/icons';

export function PreferencesButton() {
  const { t, labels } = useMessages();

  return (
    <DialogTrigger>
      <Button variant="quiet" aria-label={t(labels.preferences)}>
        <Icon>
          <Settings />
        </Icon>
      </Button>
      <Popover side="top" align="start" className="w-auto">
        <Dialog aria-label={t(labels.preferences)}>
          <Column gap="3">
            <Column gap="1">
              <Label>{t(labels.timezone)}</Label>
              <TimezoneSetting />
            </Column>
            <Column gap="1">
              <Label>{t(labels.timeFormat)}</Label>
              <TimeFormatSetting />
            </Column>
            <Column gap="1">
              <Label>{t(labels.defaultDateRange)}</Label>
              <DateRangeSetting />
            </Column>
          </Column>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
