import classNames from 'classnames';
import { mapChildren } from 'react-basics';
import styles from './Grid.module.css';

export function Grid({ className, ...otherProps }) {
  return <div {...otherProps} className={classNames(styles.grid, className)} />;
}

export function GridRow(props) {
  const { columns = 'two', className, children, ...otherProps } = props;
  return (
    <div {...otherProps} className={classNames(styles.row, className)}>
      {mapChildren(children, child => {
        return <div className={classNames(styles.col, { [styles[columns]]: true })}>{child}</div>;
      })}
    </div>
  );
}
