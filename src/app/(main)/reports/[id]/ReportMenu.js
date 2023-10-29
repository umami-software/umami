import styles from './ReportMenu.module.css';

export function ReportMenu({ children }) {
  return <div className={styles.menu}>{children}</div>;
}

export default ReportMenu;
