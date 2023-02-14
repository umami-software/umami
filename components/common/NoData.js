import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import styles from './NoData.module.css';

function NoData({ className }) {
  return (
    <div className={classNames(styles.container, className)}>
      <FormattedMessage id="message.no-data-available" defaultMessage="No data available." />
    </div>
  );
}

export default NoData;
