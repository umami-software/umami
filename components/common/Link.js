import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import NextLink from 'next/link';
import Icon from './Icon';
import styles from './Link.module.css';

function Link({ className, icon, children, size, iconRight, ...props }) {
  return (
    <NextLink {...props}>
      <a
        className={classNames(styles.link, className, {
          [styles.large]: size === 'large',
          [styles.small]: size === 'small',
          [styles.xsmall]: size === 'xsmall',
          [styles.iconRight]: iconRight,
        })}
      >
        {icon && <Icon className={styles.icon} icon={icon} size={size} />}
        {children}
      </a>
    </NextLink>
  );
}

Link.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.node,
  children: PropTypes.node,
  size: PropTypes.oneOf(['large', 'small', 'xsmall']),
  iconRight: PropTypes.bool,
};

export default Link;
