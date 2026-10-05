import { Button, Column, DialogTrigger, Icon, Label, Popover } from '@umami/react-zen';
import { DateRangeSetting } from '@/app/(main)/settings/preferences/DateRangeSetting';
import { TimezoneSetting } from '@/app/(main)/settings/preferences/TimezoneSetting';
import { Panel } from '@/components/common/Panel';
import { useMessages } from '@/components/hooks';
import { Settings } from '@/components/icons';

export function PreferencesButton() {
  const { t, labels } = useMessages();

  return (
    <DialogTrigger>
      <Button variant="quiet">
        <Icon>
          <Settings />
        </Icon>
      </Button>
      <Popover side="bottom" align="end">
        <Panel gap="3">
          <Column gap="1">
            <Label>{t(labels.timezone)}</Label>
            <TimezoneSetting />
          </Column>
          <Column gap="1">
            <Label>{t(labels.defaultDateRange)}</Label>
            <DateRangeSetting />
          </Column>
        </Panel>
      </Popover>
    </DialogTrigger>
  );
}
