import classNames from 'classnames';
import { Button, Icon, Icons } from 'react-basics';
import useMessages from 'components/hooks/useMessages';
import styles from './Pager.module.css';

export interface PagerProps {
  page: number;
  pageSize: number;
  count: number;
  onPageChange: (nextPage: number) => void;
  className?: string;
}

export function Pager({ page, pageSize, count, onPageChange, className }: PagerProps) {
  const { formatMessage, labels } = useMessages();
  const maxPage = pageSize && count ? Math.ceil(count / pageSize) : 0;
  const lastPage = page === maxPage;
  const firstPage = page === 1;

  if (count === 0 || !maxPage) {
    return null;
  }

  const handlePageChange = (value: number) => {
    const nextPage = page + value;
    if (nextPage > 0 && nextPage <= maxPage) {
      onPageChange(nextPage);
    }
  };

  if (maxPage === 1) {
    return null;
  }

  return (
    <div className={classNames(styles.pager, className)}>
      <div className={styles.count}>{formatMessage(labels.numberOfRecords, { x: count })}</div>
      <div className={styles.nav}>
        <Button onClick={() => handlePageChange(-1)} disabled={firstPage}>
          <Icon rotate={90}>
            <Icons.ChevronDown />
          </Icon>
        </Button>
        <div className={styles.text}>
          {formatMessage(labels.pageOf, { current: page, total: maxPage })}
        </div>
        <Button onClick={() => handlePageChange(1)} disabled={lastPage}>
          <Icon rotate={270}>
            <Icons.ChevronDown />
          </Icon>
        </Button>
      </div>
      <div></div>
    </div>
  );
}

export default Pager;
