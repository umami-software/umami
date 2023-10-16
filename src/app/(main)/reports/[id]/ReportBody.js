import styles from './ReportBody.module.css';

export function ReportBody({ children }) {
  return <div className={styles.body}>{children}</div>;
}

export default ReportBody;
