import React from 'react';
import classNames from 'classnames';
import styles from './Loading.module.css';

export default function Loading({ className }) {
  return (
    <div className={classNames(styles.loading, className)}>
      <div />
      <div />
      <div />
    </div>
  );
}
