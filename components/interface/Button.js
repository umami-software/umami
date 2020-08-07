import React from 'react';
import classNames from 'classnames';
import Icon from './Icon';
import styles from './Button.module.css';

export default function Button({
  type = 'button',
  icon,
  size,
  children,
  className,
  onClick = () => {},
}) {
  return (
    <button
      type={type}
      className={classNames(styles.button, className, {
        [styles.small]: size === 'S',
        [styles.large]: size === 'L',
      })}
      onClick={onClick}
    >
      {icon && <Icon icon={icon} size={size} />}
      {children}
    </button>
  );
}
