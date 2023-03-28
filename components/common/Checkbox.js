import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Icon from 'components/common/Icon';
import Check from 'assets/check.svg';
import styles from './Checkbox.module.css';

function Checkbox({ name, value, label, onChange, valueArray }) {
  const ref = useRef();
  const [isChecked, setIsChecked] = useState();

  const onClick = () => ref.current.click();

  useEffect(() => {
    setIsChecked((valueArray && valueArray.includes(value)) || (!valueArray && value));
  }, [valueArray, value]);

  return (
    <div className={styles.container}>
      <div className={styles.checkbox} onClick={onClick}>
        {isChecked && <Icon icon={<Check />} size="small" />}
      </div>
      <label className={styles.label} htmlFor={name} onClick={onClick}>
        {label}
      </label>
      <input
        ref={ref}
        className={styles.input}
        type="checkbox"
        name={name}
        value={valueArray ? value : isChecked}
        defaultChecked={isChecked}
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
