import List from 'assets/list-ul.svg';
import Modal from 'components/common/Modal';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Button from './Button';
import EventDataForm from 'components/forms/EventDataForm';
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
        icon={<List />}
        tooltip={<FormattedMessage id="label.event-data" defaultMessage="Event" />}
        tooltipId="button-event"
        size="small"
        onClick={handleClick}
        className={styles.button}
      >
        Event Data
      </Button>
      {showEventData && (
        <Modal title={<FormattedMessage id="label.event-data" defaultMessage="Query Event Data" />}>
          <EventDataForm websiteId={websiteId} onClose={handleClose} />
        </Modal>
      )}
    </>
  );
}

EventDataButton.propTypes = {
  websiteId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default EventDataButton;
