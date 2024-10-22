import { Column, Row } from 'react-basics';
import styles from './ReportsLayout.module.css';

export function ReportsLayout({ children, filter, header }) {
  return (
    <>
      <Row>{header}</Row>
      <Row>
        {filter && (
          <Column className={styles.filter} defaultSize={12} md={4} lg={3} xl={3}>
            <h2>Filters</h2>
            {filter}
          </Column>
        )}
        <Column className={styles.content} defaultSize={12} md={8} lg={9} xl={9}>
          {children}
        </Column>
      </Row>
    </>
  );
}

export default ReportsLayout;
