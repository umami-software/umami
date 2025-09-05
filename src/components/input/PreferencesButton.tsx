import { Button, Icon, DialogTrigger, Popover, Column, Label } from '@umami/react-zen';
import { TimezoneSetting } from '@/app/(main)/settings/preferences/TimezoneSetting';
import { DateRangeSetting } from '@/app/(main)/settings/preferences/DateRangeSetting';
import { Settings } from '@/components/icons';
import { useMessages } from '@/components/hooks';

export function PreferencesButton() {
  const { formatMessage, labels } = useMessages();

  return (
    <DialogTrigger>
      <Button variant="quiet">
        <Icon>
          <Settings />
        </Icon>
      </Button>
      <Popover placement="bottom end">
        <Column gap="3">
          <Label>{formatMessage(labels.timezone)}</Label>
          <TimezoneSetting />
          <Label>{formatMessage(labels.defaultDateRange)}</Label>
          <DateRangeSetting />
        </Column>
      </Popover>
    </DialogTrigger>
  );
}
