import { ReactNode } from 'react';
import { Icon, Grid, Column, Row, Label } from '@umami/react-zen';
import { useFormat, useLocale, useMessages, useRegionNames } from '@/components/hooks';
import { TypeIcon } from '@/components/common/TypeIcon';
import { KeyRound, Calendar, MapPin, Landmark } from '@/components/icons';
import { DateDistance } from '@/components/common/DateDistance';

export function SessionInfo({ data }) {
  const { locale } = useLocale();
  const { formatMessage, labels } = useMessages();
  const { formatValue } = useFormat();
  const { getRegionName } = useRegionNames(locale);

  return (
    <Grid columns="repeat(auto-fit, minmax(200px, 1fr)" gap>
      <Info label={formatMessage(labels.distinctId)} icon={<KeyRound />}>
        {data?.distinctId}
      </Info>

      <Info label={formatMessage(labels.lastSeen)} icon={<Calendar />}>
        <DateDistance date={new Date(data.lastAt)} />
      </Info>

      <Info label={formatMessage(labels.firstSeen)} icon={<Calendar />}>
        <DateDistance date={new Date(data.firstAt)} />
      </Info>

      <Info
        label={formatMessage(labels.country)}
        icon={<TypeIcon type="country" value={data?.country} />}
      >
        {formatValue(data?.country, 'country')}
      </Info>

      <Info label={formatMessage(labels.region)} icon={<MapPin />}>
        {getRegionName(data?.region)}
      </Info>

      <Info label={formatMessage(labels.city)} icon={<Landmark />}>
        {data?.city}
      </Info>

      <Info
        label={formatMessage(labels.browser)}
        icon={<TypeIcon type="browser" value={data?.browser} />}
      >
        {formatValue(data?.browser, 'browser')}
      </Info>

      <Info
        label={formatMessage(labels.os)}
        icon={<TypeIcon type="os" value={data?.os?.toLowerCase()?.replaceAll(/\W/g, '-')} />}
      >
        {formatValue(data?.os, 'os')}
      </Info>

      <Info
        label={formatMessage(labels.device)}
        icon={<TypeIcon type="device" value={data?.device} />}
      >
        {formatValue(data?.device, 'device')}
      </Info>
    </Grid>
  );
}

const Info = ({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
}) => {
  return (
    <Column>
      <Label>{label}</Label>
      <Row alignItems="center" gap>
        {icon && <Icon>{icon}</Icon>}
        {children || '—'}
      </Row>
    </Column>
  );
};
