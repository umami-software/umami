import TimeUnitSettings from 'app/(main)/profile/TimeUnitSettings';
import { useDateRange, useMessages } from 'components/hooks';
import useTimeUnit from 'components/hooks/useTimeUnit';
import { Button, Form, FormRow, Modal } from 'react-basics';
import styles from './WebsiteChartSettings.module.css';

export interface WebsiteChartSettingsProps {
  websiteId: string;
  isOpened?: boolean;
  onClose: () => void;
  onChange?: (value: string) => void;
}

export function WebsiteChartSettings({ websiteId, onClose }: WebsiteChartSettingsProps) {
  const { formatMessage, labels } = useMessages();
  const { dateRange } = useDateRange(websiteId);
  const { saveTimeUnit } = useTimeUnit(dateRange);

  const handleSave = () => {
    saveTimeUnit();
    onClose();
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
