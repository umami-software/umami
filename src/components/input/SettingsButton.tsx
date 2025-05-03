import { Button, Icon, DialogTrigger, Popover, Column, Label } from '@umami/react-zen';
import { TimezoneSetting } from '@/app/(main)/settings/profile/TimezoneSetting';
import { DateRangeSetting } from '@/app/(main)/settings/profile/DateRangeSetting';
import { Icons } from '@/components/icons';
import { useMessages } from '@/components/hooks';

export function SettingsButton() {
  const { formatMessage, labels } = useMessages();

  return (
    <DialogTrigger>
      <Button variant="quiet">
        <Icon>
          <Icons.Gear />
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
