import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import Icon from 'components/common/Icon';
import Check from 'assets/check.svg';
import styles from './Checkbox.module.css';

function Checkbox({ name, value, label, onChange }) {
  const ref = useRef();

  const onClick = () => ref.current.click();

  return (
    <div className={styles.container}>
      <div className={styles.checkbox} onClick={onClick}>
        {value && <Icon icon={<Check />} size="small" />}
      </div>
      <label className={styles.label} htmlFor={name} onClick={onClick}>
        {label}
      </label>
      <input
        ref={ref}
        className={styles.input}
        type="checkbox"
        name={name}
        defaultChecked={value}
        onChange={onChange}
      />
    </div>
  );
}

Checkbox.propTypes = {
  name: PropTypes.string,
  value: PropTypes.any,
  label: PropTypes.node,
  onChange: PropTypes.func,
};

export default Checkbox;
