import classNames from 'classnames';
import styles from './Page.module.css';

export default function Page({ className, children }) {
  return <div className={classNames(styles.page, className)}>{children}</div>;
}
