import React from 'react';
import classNames from 'classnames';
import styles from './Icon.module.css';

export default function Icon({ icon, className }) {
  return <div className={classNames(styles.icon, className)}>{icon}</div>;
}
