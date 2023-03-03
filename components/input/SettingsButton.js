import { useIntl } from 'react-intl';
import { Button, Icon, Tooltip, PopupTrigger, Popup, Form, FormRow } from 'react-basics';
import TimezoneSetting from 'components/pages/settings/profile/TimezoneSetting';
import DateRangeSetting from 'components/pages/settings/profile/DateRangeSetting';
import Icons from 'components/icons';
import { labels } from 'components/messages';
import styles from './SettingsButton.module.css';

export default function SettingsButton() {
  const { formatMessage } = useIntl();

  return (
    <PopupTrigger>
      <Tooltip label={formatMessage(labels.settings)} position="bottom">
        <Button variant="quiet">
          <Icon>
            <Icons.Gear />
          </Icon>
        </Button>
      </Tooltip>
      <Popup className={styles.popup} position="bottom" alignment="end">
        <Form>
          <FormRow label={formatMessage(labels.timezone)}>
            <TimezoneSetting />
          </FormRow>
          <FormRow label={formatMessage(labels.defaultDateRange)}>
            <DateRangeSetting />
          </FormRow>
        </Form>
      </Popup>
    </PopupTrigger>
  );
}
