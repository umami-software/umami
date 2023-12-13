import { safeDecodeURI } from 'next-basics';
import { Button, Icon, Icons, Text } from 'react-basics';
import useNavigation from 'components/hooks/useNavigation';
import useMessages from 'components/hooks/useMessages';
import useFormat from 'components/hooks/useFormat';
import styles from './FilterTags.module.css';

export function FilterTags({ params }) {
  const { formatMessage, labels } = useMessages();
  const { formatValue } = useFormat();
  const {
    router,
    makeUrl,
    query: { view },
  } = useNavigation();

  if (Object.keys(params).filter(key => params[key]).length === 0) {
    return null;
  }

  function handleCloseFilter(param?: string) {
    router.push(makeUrl({ [param]: undefined }));
  }

  function handleResetFilter() {
    router.push(makeUrl({ view }, true));
  }

  return (
    <div className={styles.filters}>
      <div className={styles.label}>{formatMessage(labels.filters)}</div>
      {Object.keys(params).map(key => {
        if (!params[key]) {
          return null;
        }
        return (
          <div key={key} className={styles.tag} onClick={() => handleCloseFilter(key)}>
            <Text>
              <b>{formatMessage(labels[key])}</b> = {formatValue(safeDecodeURI(params[key]), key)}
            </Text>
            <Icon>
              <Icons.Close />
            </Icon>
          </div>
        );
      })}
      <Button size="sm" variant="quiet" onClick={handleResetFilter}>
        <Icon>
          <Icons.Close />
        </Icon>
        <Text>{formatMessage(labels.clearAll)}</Text>
      </Button>
    </div>
  );
}

export default FilterTags;
