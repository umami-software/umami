import styles from './Pager.module.css';
import { Button, Flexbox, Icon, Icons } from 'react-basics';
import useMessages from 'hooks/useMessages';

export function Pager({ page, pageSize, count, onPageChange }) {
  const { formatMessage, labels } = useMessages();
  const maxPage = Math.ceil(count / pageSize);
  const lastPage = page === maxPage;
  const firstPage = page === 1;

  if (count === 0) {
    return null;
  }

  const handlePageChange = value => {
    const nextPage = page + value;
    if (nextPage > 0 && nextPage <= maxPage) {
      onPageChange(nextPage);
    }
  };

  return (
    <Flexbox justifyContent="center" className={styles.container}>
      <Button onClick={() => handlePageChange(-1)} disabled={firstPage}>
        <Icon size="lg" className={styles.icon} rotate={90}>
          <Icons.ChevronDown />
        </Icon>
      </Button>
      <Flexbox alignItems="center" className={styles.text}>
        {formatMessage(labels.pageOf, { x: page, y: maxPage })}
      </Flexbox>
      <Button onClick={() => handlePageChange(1)} disabled={lastPage}>
        <Icon size="lg" className={styles.icon} rotate={270}>
          <Icons.ChevronDown />
        </Icon>
      </Button>
    </Flexbox>
  );
}

export default Pager;
