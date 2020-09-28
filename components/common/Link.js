import React from 'react';
import classNames from 'classnames';
import NextLink from 'next/link';
import Icon from './Icon';
import styles from './Link.module.css';

export default function Link({ className, icon, children, size, iconRight, ...props }) {
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
