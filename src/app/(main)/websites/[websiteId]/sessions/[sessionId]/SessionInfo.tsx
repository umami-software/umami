import { useFormat, useLocale, useMessages, useRegionNames, useTimezone } from 'components/hooks';
import TypeIcon from 'components/common/TypeIcon';
import { Icon, CopyIcon } from 'react-basics';
import Icons from 'components/icons';
import styles from './SessionInfo.module.css';

export default function SessionInfo({ data }) {
  const { locale } = useLocale();
  const { formatTimezoneDate } = useTimezone();
  const { formatMessage, labels } = useMessages();
  const { formatValue } = useFormat();
  const { getRegionName } = useRegionNames(locale);

  return (
    <div className={styles.info}>
      <dl>
        <dt>ID</dt>
        <dd>
          {data?.id} <CopyIcon value={data?.id} />
        </dd>

        <dt>{formatMessage(labels.lastSeen)}</dt>
        <dd>{formatTimezoneDate(data?.lastAt, 'EEEE, PPPpp')}</dd>

        <dt>{formatMessage(labels.firstSeen)}</dt>
        <dd>{formatTimezoneDate(data?.firstAt, 'EEEE, PPPpp')}</dd>

        <dt>{formatMessage(labels.country)}</dt>
        <dd>
          <TypeIcon type="country" value={data?.country} />
          {formatValue(data?.country, 'country')}
        </dd>

        <dt>{formatMessage(labels.region)}</dt>
        <dd>
          <Icon>
            <Icons.Location />
          </Icon>
          {getRegionName(data?.subdivision1)}
        </dd>

        <dt>{formatMessage(labels.city)}</dt>
        <dd>
          <Icon>
            <Icons.Location />
          </Icon>
          {data?.city}
        </dd>

        <dt>{formatMessage(labels.os)}</dt>
        <dd>
          <TypeIcon type="os" value={data?.os?.toLowerCase()?.replaceAll(/\W/g, '-')} />
          {formatValue(data?.os, 'os')}
        </dd>

        <dt>{formatMessage(labels.device)}</dt>
        <dd>
          <TypeIcon type="device" value={data?.device} />
          {formatValue(data?.device, 'device')}
        </dd>

        <dt>{formatMessage(labels.browser)}</dt>
        <dd>
          <TypeIcon type="browser" value={data?.browser} />
          {formatValue(data?.browser, 'browser')}
        </dd>
      </dl>
    </div>
  );
}
