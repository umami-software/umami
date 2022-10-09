import React from 'react';
import PropTypes from 'prop-types';
import styles from './Favicon.module.css';

function Favicon({ url, ...props }) {
  const faviconUrl = url ? url : '/default-favicon.png';

  return <img className={styles.favicon} src={faviconUrl} height="16" alt="" {...props} />;
}

Favicon.propTypes = {
  url: PropTypes.string,
};

export default Favicon;
