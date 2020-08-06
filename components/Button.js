import React from 'react';
import classNames from 'classnames';
import Icon from './Icon';
import styles from './Button.module.css';

export default function Button({ icon, type = 'button', children, className, onClick = () => {} }) {
  return (
    <button type={type} className={classNames(styles.button, className)} onClick={onClick}>
      {icon && <Icon icon={icon} />}
      {children}
    </button>
  );
}
