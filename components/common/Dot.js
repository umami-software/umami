import React from 'react';
import classNames from 'classnames';
import styles from './Dot.module.css';

export default function Dot({ color, size, className }) {
  return (
    <div
      style={{ background: color }}
      className={classNames(styles.dot, className, {
        [styles.small]: size === 'small',
        [styles.large]: size === 'large',
      })}
    />
  );
}
