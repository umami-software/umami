import ListTable from 'components/metrics/ListTable';
import { useMessages } from 'components/hooks';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import styles from './RealtimeCountries.module.css';
import TypeIcon from 'components/common/TypeIcon';

export function RealtimeCountries({ data }) {
  const { formatMessage, labels } = useMessages();
  const intl = useIntl();

  const renderCountryName = ({ x: code }) => (
    <span className={classNames(styles.row)}>
      <TypeIcon type="country" value={code?.toLowerCase()} />
      {intl.formatDisplayName(code, { type: 'region' })}
    </span>
  );

  return (
    <ListTable
      title={formatMessage(labels.countries)}
      metric={formatMessage(labels.visitors)}
      data={data}
      renderLabel={renderCountryName}
    />
  );
}

export default RealtimeCountries;
