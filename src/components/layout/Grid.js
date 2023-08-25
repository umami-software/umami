import { Row, Column } from 'react-basics';
import classNames from 'classnames';
import styles from './Grid.module.css';

export function GridRow(props) {
  const { className, ...otherProps } = props;
  return <Row {...otherProps} className={classNames(styles.row, className)} />;
}

export function GridColumn(props) {
  const { className, ...otherProps } = props;
  return <Column {...otherProps} className={classNames(styles.col, className)} />;
}
