import React from 'react';
import classNames from 'classnames';
import styles from './Icon.module.css';

export default function Icon({ icon, className, size = 'M' }) {
  return (
    <div
      className={classNames(styles.icon, className, {
        [styles.large]: size === 'L',
        [styles.medium]: size === 'M',
        [styles.small]: size === 'S',
      })}
    >
      {icon}
    </div>
  );
}
