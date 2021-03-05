import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './Tag.module.css';

function Tag({ className, children }) {
  return <span className={classNames(styles.tag, className)}>{children}</span>;
}

Tag.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Tag;
