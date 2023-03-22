import { safeDecodeURI } from 'next-basics';
import { Button, Icon, Icons, Text } from 'react-basics';
import usePageQuery from 'hooks/usePageQuery';
import styles from './FilterTags.module.css';
import useMessages from 'hooks/useMessages';

export default function FilterTags({ websiteId, params }) {
  const { formatMessage, labels } = useMessages();
  const {
    router,
    resolveUrl,
    query: { view },
  } = usePageQuery();

  if (Object.keys(params).filter(key => params[key]).length === 0) {
    return null;
  }

  function handleCloseFilter(param) {
    if (param === null) {
      router.push(`/websites/${websiteId}/?view=${view}`);
    } else {
      router.push(resolveUrl({ [param]: undefined }));
    }
  }

  return (
    <div className={styles.filters}>
      {Object.keys(params).map(key => {
        if (!params[key]) {
          return null;
        }
        return (
          <div key={key} className={styles.tag} onClick={() => handleCloseFilter(key)}>
            <Text>
              <b>{`${key}`}</b> = {`${safeDecodeURI(params[key])}`}
            </Text>
            <Icon>
              <Icons.Close />
            </Icon>
          </div>
        );
      })}
      <Button size="sm" variant="quiet" onClick={() => handleCloseFilter(null)}>
        <Icon>
          <Icons.Close />
        </Icon>
        <Text>{formatMessage(labels.clearAll)}</Text>
      </Button>
    </div>
  );
}
