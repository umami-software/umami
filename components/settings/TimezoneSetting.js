import React from 'react';
import { FormattedMessage } from 'react-intl';
import { listTimeZones } from 'timezone-support';
import DropDown from 'components/common/DropDown';
import Button from 'components/common/Button';
import useTimezone from 'hooks/useTimezone';
import { getTimezone } from 'lib/date';
import styles from './TimezoneSetting.module.css';

export default function TimezoneSetting() {
  const [timezone, saveTimezone] = useTimezone();
  const options = listTimeZones().map(n => ({ label: n, value: n }));

  function handleReset() {
    saveTimezone(getTimezone());
  }

  return (
    <>
      <DropDown
        menuClassName={styles.menu}
        value={timezone}
        options={options}
        onChange={saveTimezone}
      />
      <Button className={styles.button} size="small" onClick={handleReset}>
        <FormattedMessage id="label.reset" defaultMessage="Reset" />
      </Button>
    </>
  );
}
