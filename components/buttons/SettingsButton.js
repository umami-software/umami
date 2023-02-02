import { useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import TimezoneSetting from '../pages/settings/profile/TimezoneSetting';
import DateRangeSetting from '../pages/settings/profile/DateRangeSetting';
import { Button, Icon } from 'react-basics';
import styles from './SettingsButton.module.css';
import Gear from 'assets/gear.svg';
import useDocumentClick from '../../hooks/useDocumentClick';

export default function SettingsButton() {
  const [show, setShow] = useState(false);
  const ref = useRef();

  function handleClick() {
    setShow(state => !state);
  }

  useDocumentClick(e => {
    if (!ref.current?.contains(e.target)) {
      setShow(false);
    }
  });

  return (
    <div className={styles.button} ref={ref}>
      <Button variant="light" onClick={handleClick}>
        <Icon>
          <Gear />
        </Icon>
      </Button>
      {show && (
        <div className={styles.panel}>
          <dt>
            <FormattedMessage id="label.timezone" defaultMessage="Timezone" />
          </dt>
          <dd>
            <TimezoneSetting />
          </dd>
          <dt>
            <FormattedMessage id="label.default-date-range" defaultMessage="Default date range" />
          </dt>
          <dd>
            <DateRangeSetting />
          </dd>
        </div>
      )}
    </div>
  );
}
