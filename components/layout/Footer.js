import React from 'react';
import classNames from 'classnames';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={classNames(styles.footer, 'container mt-5 mb-5')}>
      umami - deliciously simple web stats
    </footer>
  );
}
