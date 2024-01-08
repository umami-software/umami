import { CSSProperties } from 'react';
import classNames from 'classnames';
import { mapChildren } from 'react-basics';
import styles from './Grid.module.css';

export interface GridProps {
  className?: string;
  style?: CSSProperties;
  children?: any;
}

export function Grid({ className, style, children }: GridProps) {
  return (
    <div className={classNames(styles.grid, className)} style={style}>
      {children}
    </div>
  );
}

export function GridRow(props: {
  [x: string]: any;
  columns?: 'one' | 'two' | 'three' | 'one-two' | 'two-one';
  className?: string;
  children?: any;
}) {
  const { columns = 'two', className, children, ...otherProps } = props;
  return (
    <div {...otherProps} className={classNames(styles.row, className)}>
      {mapChildren(children, child => {
        return <div className={classNames(styles.col, { [styles[columns]]: true })}>{child}</div>;
      })}
    </div>
  );
}
