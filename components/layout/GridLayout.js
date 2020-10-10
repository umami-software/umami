import React from 'react';
import classNames from 'classnames';
import styles from './GridLayout.module.css';

export default function GridLayout({ className, children }) {
  return <div className={classNames(styles.grid, className)}>{children}</div>;
}

export const GridRow = ({ className, children }) => {
  return <div className={classNames(styles.row, className, 'row')}>{children}</div>;
};

export const GridColumn = ({ xs, sm, md, lg, xl, className, children }) => {
  const classes = [];

  classes.push(xs ? `col-${xs}` : 'col-12');

  if (sm) {
    classes.push(`col-sm-${sm}`);
  }
  if (md) {
    classes.push(`col-md-${md}`);
  }
  if (lg) {
    classes.push(`col-lg-${lg}`);
  }
  if (xl) {
    classes.push(`col-lg-${xl}`);
  }
  return <div className={classNames(styles.col, classes, className)}>{children}</div>;
};
