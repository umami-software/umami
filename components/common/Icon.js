import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './Icon.module.css';

function Icon({ icon, className, size = 'medium', ...props }) {
  return (
    <div
      className={classNames(styles.icon, className, {
        [styles.xlarge]: size === 'xlarge',
        [styles.large]: size === 'large',
        [styles.medium]: size === 'medium',
        [styles.small]: size === 'small',
        [styles.xsmall]: size === 'xsmall',
      })}
      {...props}
    >
      {icon}
    </div>
  );
}

Icon.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['xlarge', 'large', 'medium', 'small', 'xsmall']),
};

export default Icon;
