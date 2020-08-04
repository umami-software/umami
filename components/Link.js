import React from 'react';
import classNames from 'classnames';
import NextLink from 'next/link';
import styles from './Link.module.css';

export default function Link({ href, className, children }) {
  return (
    <NextLink href={href}>
      <a className={classNames(styles.link, className)}>{children}</a>
    </NextLink>
  );
}
