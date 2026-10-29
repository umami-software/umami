import { Column, Grid, Icon, Row, Text } from '@umami/react-zen';
import type { ReactNode } from 'react';
import { DateDistance } from '@/components/common/DateDistance';
import { Favicon } from '@/components/common/Favicon';
import { TypeIcon } from '@/components/common/TypeIcon';
import { useFormat, useLocale, useMessages, useRegionNames } from '@/components/hooks';
import {
  AppWindow,
  Calendar,
  Cpu,
  Earth,
  KeyRound,
  Landmark,
  Laptop,
  MapPin,
  Share2,
} from '@/components/icons';
import { Network } from '@/components/svg';
import { decodePunycodeDomain } from '@/lib/format';

export function SessionInfo({ data }) {
  const { locale } = useLocale();
  const { t, labels } = useMessages();
  const { formatValue } = useFormat();
  const { getRegionName } = useRegionNames(locale);
  const distinctId =
    data?.distinctIds?.length > 1
      ? `${data.distinctIds.length} linked IDs`
      : data?.distinctId?.trim();
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

      <Info
        label={t(labels.referrer)}
        icon={data?.referrerDomain ? <Favicon domain={data.referrerDomain} /> : <Share2 />}
      >
        {data?.referrerDomain && (
          <Text truncate title={data.referrerDomain}>
            <a href={`https://${data.referrerDomain}`} target="_blank" rel="noreferrer noopener">
              {decodePunycodeDomain(data.referrerDomain)}
            </a>
          </Text>
        )}
      </Info>

      <Info
        label={t(labels.country)}
        icon={data?.country ? <TypeIcon type="country" value={data.country} /> : <Earth />}
      >
        {formatValue(data?.country, 'country')}
      </Info>

      <Info label={t(labels.region)} icon={<MapPin />}>
        {getRegionName(data?.region)}
      </Info>

      <Info label={t(labels.city)} icon={<Landmark />}>
        {data?.city}
      </Info>

      <Info
        label={t(labels.browser)}
        icon={data?.browser ? <TypeIcon type="browser" value={data.browser} /> : <AppWindow />}
      >
        {formatValue(data?.browser, 'browser')}
      </Info>

      <Info
        label={t(labels.os)}
        icon={
          data?.os ? (
            <TypeIcon type="os" value={data.os.toLowerCase().replaceAll(/\W/g, '-')} />
          ) : (
            <Cpu />
          )
        }
      >
        {formatValue(data?.os, 'os')}
      </Info>

      <Info
        label={t(labels.device)}
        icon={data?.device ? <TypeIcon type="device" value={data.device} /> : <Laptop />}
      >
        {data?.device && formatValue(data.device, 'device')}
      </Info>

      {distinctId && stitchedSessionCount > 1 && (
        <Info label="Linked sessions" icon={<Network />}>
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
    <Column gap="2" minWidth="0">
      <Text weight="bold">{label}</Text>
      <Row alignItems="center" gap>
        {icon && <Icon>{icon}</Icon>}
        {children || '—'}
      </Row>
    </Column>
  );
};
