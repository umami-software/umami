import { Column, Grid, Icon, Label, Row } from '@umami/react-zen';
import type { ReactNode } from 'react';
import { DateDistance } from '@/components/common/DateDistance';
import { TypeIcon } from '@/components/common/TypeIcon';
import { useFormat, useLocale, useMessages, useRegionNames } from '@/components/hooks';
import { Calendar, KeyRound, Landmark, MapPin } from '@/components/icons';
import { Network } from '@/components/svg';

export function SessionInfo({ data }) {
  const { locale } = useLocale();
  const { t, labels } = useMessages();
  const { formatValue } = useFormat();
  const { getRegionName } = useRegionNames(locale);
  const distinctId = data?.distinctId?.trim();
  const stitchedSessionCount = data?.stitchedSessionCount;

  return (
    <Grid columns="repeat(auto-fit, minmax(200px, 1fr)" gap>
      <Info label={t(labels.distinctId)} icon={<KeyRound />}>
        {distinctId ? <span style={{ overflowWrap: 'anywhere' }}>{distinctId}</span> : '—'}
      </Info>

      <Info label={t(labels.lastSeen)} icon={<Calendar />}>
        <DateDistance date={new Date(data.lastAt)} />
      </Info>

      <Info label={t(labels.firstSeen)} icon={<Calendar />}>
        <DateDistance date={new Date(data.firstAt)} />
      </Info>

      <Info label={t(labels.country)} icon={<TypeIcon type="country" value={data?.country} />}>
        {formatValue(data?.country, 'country')}
      </Info>

      <Info label={t(labels.region)} icon={<MapPin />}>
        {getRegionName(data?.region)}
      </Info>

      <Info label={t(labels.city)} icon={<Landmark />}>
        {data?.city}
      </Info>

      <Info label={t(labels.browser)} icon={<TypeIcon type="browser" value={data?.browser} />}>
        {formatValue(data?.browser, 'browser')}
      </Info>

      <Info
        label={t(labels.os)}
        icon={<TypeIcon type="os" value={data?.os?.toLowerCase()?.replaceAll(/\W/g, '-')} />}
      >
        {formatValue(data?.os, 'os')}
      </Info>

      <Info label={t(labels.device)} icon={<TypeIcon type="device" value={data?.device} />}>
        {formatValue(data?.device, 'device')}
      </Info>

      {distinctId && stitchedSessionCount > 1 && (
        <Info label="Linked IDs" icon={<Network />}>
          {stitchedSessionCount}
        </Info>
      )}
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
