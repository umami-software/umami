import EventDataForm from 'components/metrics/EventDataForm';
import { useState } from 'react';
import { Button, Icon, Modal, Icons } from 'react-basics';
import { FormattedMessage } from 'react-intl';
import styles from './EventDataButton.module.css';

function EventDataButton({ websiteId }) {
  const [showEventData, setShowEventData] = useState(false);

  function handleClick() {
    if (!showEventData) {
      setShowEventData(true);
    }
  }

  function handleClose() {
    setShowEventData(false);
  }

  return (
    <>
      <Button
        tooltip={<FormattedMessage id="label.event-data" defaultMessage="Event" />}
        tooltipId="button-event"
        size="sm"
        onClick={handleClick}
        className={styles.button}
      >
        <Icon>
          <Icons.More />
        </Icon>
        Event Data
      </Button>
      {showEventData && (
        <Modal
          title={<FormattedMessage id="label.event-data" defaultMessage="Query Event Data" />}
          onClose={handleClose}
        >
          {close => <EventDataForm websiteId={websiteId} onClose={close} />}
        </Modal>
      )}
    </>
  );
}

export default EventDataButton;
