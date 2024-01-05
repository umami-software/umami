import { Button, Icon, PopupTrigger, Popup, Form, FormRow } from 'react-basics';
import TimezoneSetting from 'app/(main)/settings/profile/TimezoneSetting';
import DateRangeSetting from 'app/(main)/settings/profile/DateRangeSetting';
import Icons from 'components/icons';
import useMessages from 'components/hooks/useMessages';
import styles from './SettingsButton.module.css';

export function SettingsButton() {
  const { formatMessage, labels } = useMessages();

  return (
    <PopupTrigger>
      <Button variant="quiet">
        <Icon>
          <Icons.Gear />
        </Icon>
      </Button>
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

export default SettingsButton;
