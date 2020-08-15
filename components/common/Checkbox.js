import React, { useRef } from 'react';
import Icon from 'components/common/Icon';
import Check from 'assets/check.svg';
import styles from './Checkbox.module.css';

export default function Checkbox({ name, value, label, onChange }) {
  const ref = useRef();

  return (
    <div className={styles.container}>
      <div className={styles.checkbox} onClick={() => ref.current.click()}>
        {value && <Icon icon={<Check />} size="small" />}
      </div>
      <label className={styles.label} htmlFor={name}>
        {label}
      </label>
      <input
        ref={ref}
        className={styles.input}
        type="checkbox"
        name={name}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
