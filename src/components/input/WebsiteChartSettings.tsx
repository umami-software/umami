import TimeUnitSettings from 'app/(main)/profile/TimeUnitSettings';
import { useMessages } from 'components/hooks';
import { Button, Form, FormRow, Modal } from 'react-basics';
import styles from './WebsiteChartSettings.module.css';

export interface WebsiteChartSettingsProps {
  isOpened?: boolean;
  onClose?: () => void;
  onChange?: (value: string) => void;
}

export function WebsiteChartSettings({ onClose }: WebsiteChartSettingsProps) {
  const { formatMessage, labels } = useMessages();

  const handleSave = () => {
    // Save the settings
  };

  const handleClose = () => onClose();

  return (
    <>
      <Modal onClose={handleClose}>
        <div className={styles.container}>
          <div>
            <Form>
              <FormRow label={formatMessage(labels.timeUnit)}>
                <TimeUnitSettings />
              </FormRow>
            </Form>
          </div>
          <div className={styles.buttons}>
            <Button variant="primary" onClick={handleSave} disabled={false}>
              {formatMessage(labels.save)}
            </Button>
            <Button onClick={onClose}>{formatMessage(labels.cancel)}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default WebsiteChartSettings;
