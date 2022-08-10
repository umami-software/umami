import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { useSpring, animated } from 'react-spring';
import Icon from 'components/common/Icon';
import Close from 'assets/times.svg';
import styles from './Toast.module.css';

function Toast({ message, timeout = 3000, onClose }) {
  const props = useSpring({
    opacity: 1,
    transform: 'translate3d(0,0px,0)',
    from: { opacity: 0, transform: 'translate3d(0,-40px,0)' },
  });

  useEffect(() => {
    setTimeout(onClose, timeout);
  }, []);

  return ReactDOM.createPortal(
    <animated.div className={styles.toast} style={props} onClick={onClose}>
      <div className={styles.message}>{message}</div>
      <Icon className={styles.close} icon={<Close />} size="small" />
    </animated.div>,
    document.getElementById('__modals'),
  );
}

Toast.propTypes = {
  message: PropTypes.node,
  timeout: PropTypes.number,
  onClose: PropTypes.func,
};

export default Toast;
