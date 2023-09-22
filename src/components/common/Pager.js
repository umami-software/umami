import classNames from 'classnames';
import { Button, Flexbox, Icon, Icons } from 'react-basics';
import useMessages from 'components/hooks/useMessages';
import styles from './Pager.module.css';

export function Pager({ page, pageSize, count, onPageChange, className }) {
  const { formatMessage, labels } = useMessages();
  const maxPage = pageSize && count ? Math.ceil(count / pageSize) : 0;
  const lastPage = page === maxPage;
  const firstPage = page === 1;

  if (count === 0 || !maxPage) {
    return null;
  }

  const handlePageChange = value => {
    const nextPage = page + value;
    if (nextPage > 0 && nextPage <= maxPage) {
      onPageChange(nextPage);
    }
  };

  if (maxPage === 1) {
    return null;
  }

  return (
    <Flexbox justifyContent="center" className={classNames(styles.container, className)}>
      <Button onClick={() => handlePageChange(-1)} disabled={firstPage}>
        <Icon rotate={90}>
          <Icons.ChevronDown />
        </Icon>
      </Button>
      <Flexbox alignItems="center" className={styles.text}>
        {formatMessage(labels.pageOf, { current: page, total: maxPage })}
      </Flexbox>
      <Button onClick={() => handlePageChange(1)} disabled={lastPage}>
        <Icon rotate={270}>
          <Icons.ChevronDown />
        </Icon>
      </Button>
    </Flexbox>
  );
}

export default Pager;
