import Page from 'components/layout/Page';
import styles from './reports.module.css';

export function Report({ children, ...props }) {
  return (
    <Page {...props} className={styles.container}>
      {children}
    </Page>
  );
}

export default Report;
