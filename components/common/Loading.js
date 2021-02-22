import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './Loading.module.css';

function Loading({ className }) {
  return (
    <div className={classNames(styles.loading, className)}>
      <div />
      <div />
      <div />
    </div>
  );
}

Loading.propTypes = {
  className: PropTypes.string,
};

export default Loading;
