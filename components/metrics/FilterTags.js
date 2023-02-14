import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { safeDecodeURI } from 'next-basics';
import { Button, Icon, Icons, Text } from 'react-basics';
import { labels } from 'components/messages';
import styles from './FilterTags.module.css';

export default function FilterTags({ className, params, onClick }) {
  const { formatMessage } = useIntl();

  if (Object.keys(params).filter(key => params[key]).length === 0) {
    return null;
  }

  return (
    <div className={classNames(styles.filters, className)}>
      {Object.keys(params).map(key => {
        if (!params[key]) {
          return null;
        }
        return (
          <div key={key} className={styles.tag}>
            <Button onClick={() => onClick(key)} variant="primary" size="sm">
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
      <Button size="sm" variant="quiet" onClick={() => onClick(null)}>
        <Icon>
          <Icons.Close />
        </Icon>
        <Text>{formatMessage(labels.clearAll)}</Text>
      </Button>
    </div>
  );
}
