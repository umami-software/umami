import { useIntl } from 'react-intl';
import { Dropdown, Item } from 'react-basics';
import MetricCard from 'components/metrics/MetricCard';
import { labels } from 'components/messages';
import styles from './RealtimeHeader.module.css';

export default function RealtimeHeader({ data, websiteId, websites, onSelect }) {
  const { formatMessage } = useIntl();

  const { pageviews, sessions, events, countries } = data;

  const renderValue = value => {
    return websites?.find(({ id }) => id === value)?.name;
  };

  return (
    <div className={styles.header}>
      <div className={styles.metrics}>
        <MetricCard label={formatMessage(labels.views)} value={pageviews?.length} hideComparison />
        <MetricCard
          label={formatMessage(labels.visitors)}
          value={sessions?.length}
          hideComparison
        />
        <MetricCard label={formatMessage(labels.events)} value={events?.length} hideComparison />
        <MetricCard
          label={formatMessage(labels.countries)}
          value={countries.length}
          hideComparison
        />
      </div>
      <Dropdown
        items={websites}
        value={websiteId}
        renderValue={renderValue}
        onChange={onSelect}
        alignment="end"
        placeholder={formatMessage(labels.selectWebsite)}
      >
        {item => <Item key={item.id}>{item.name}</Item>}
      </Dropdown>
    </div>
  );
}
