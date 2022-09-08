import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './Loading.module.css';

function Loading({ className, overlay = false }) {
  return (
    <div className={classNames(styles.loading, { [styles.overlay]: overlay }, className)}>
      <div />
      <div />
      <div />
    </div>
  );
}

Loading.propTypes = {
  className: PropTypes.string,
  overlay: PropTypes.bool,
};

export default Loading;
