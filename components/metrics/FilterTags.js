import { useIntl } from 'react-intl';
import { safeDecodeURI } from 'next-basics';
import { Button, Icon, Icons, Text } from 'react-basics';
import { labels } from 'components/messages';
import usePageQuery from 'hooks/usePageQuery';
import styles from './FilterTags.module.css';

export default function FilterTags({ websiteId, params, onClick }) {
  const { formatMessage } = useIntl();
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
          <div key={key} className={styles.tag}>
            <Button onClick={() => handleCloseFilter(key)} variant="primary" size="sm">
              <Text>
                <b>{`${key}`}</b> — {`${safeDecodeURI(params[key])}`}
              </Text>
              <Icon>
                <Icons.Close />
              </Icon>
            </Button>
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
