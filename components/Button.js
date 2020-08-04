import React from 'react';
import classNames from 'classnames';
import Icon from './Icon';
import styles from './Button.module.css';

export default function Button({ icon, children, className, onClick }) {
  return (
    <button type="button" className={classNames(styles.button, className)} onClick={onClick}>
      {icon && <Icon icon={icon} />}
      {children}
    </button>
  );
}
