import Link from 'next/link';
import classNames from 'classnames';
import { Button, Icon } from 'react-basics';
import styles from './PageHeader.module.css';

export default function PageHeader({ title, backUrl, children, className, style }) {
  return (
    <div className={classNames(styles.header, className)} style={style}>
      <div className={styles.title}>
        {backUrl && (
          <Link href={backUrl}>
            <a>
              <Button>
                <Icon icon="arrow-left" /> Back
              </Button>
            </a>
          </Link>
        )}
        {title}
      </div>
      {children}
    </div>
  );
}
