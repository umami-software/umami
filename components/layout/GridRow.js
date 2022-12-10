import { Row, cloneChildren } from 'react-basics';
import styles from './GridRow.module.css';
import classNames from 'classnames';

export default function GridRow(props) {
  const { children, className, ...rowProps } = props;
  return (
    <Row {...rowProps} className={className}>
      {breakpoint =>
        cloneChildren(children, () => {
          return {
            className: classNames(styles.column, styles[breakpoint]),
          };
        })
      }
    </Row>
  );
}
