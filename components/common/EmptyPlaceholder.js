import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'components/common/Icon';
import styles from './EmptyPlaceholder.module.css';

function EmptyPlaceholder({ msg, children }) {
  return (
    <div className={styles.placeholder}>
      <Icon
        className={styles.icon}
        icon={
          <img
            src="https://uploads-ssl.webflow.com/5ea18b09bf3bfd55814199f9/5ea18b09bf3bfda137419a00_petri_square_03.gif"
            className={styles.logo}
            alt="Logo"
          />
        }
        size="xlarge"
      />
      <h2 className={styles.msg}>{msg}</h2>
      {children}
    </div>
  );
}

EmptyPlaceholder.propTypes = {
  msg: PropTypes.node,
  children: PropTypes.node,
};

export default EmptyPlaceholder;
