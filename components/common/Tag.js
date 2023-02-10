import classNames from 'classnames';
import styles from './Tag.module.css';

function Tag({ className, children }) {
  return <span className={classNames(styles.tag, className)}>{children}</span>;
}

export default Tag;
