import React from 'react';
import { useSpring, animated } from 'react-spring';
import styles from './Modal.module.css';

export default function Modal({ title, children }) {
  const props = useSpring({ opacity: 1, from: { opacity: 0 } });

  return (
    <animated.div className={styles.modal} style={props}>
      <div className={styles.content}>
        {title && <div className={styles.header}>{title}</div>}
        <div className={styles.body}>{children}</div>
      </div>
    </animated.div>
  );
}
