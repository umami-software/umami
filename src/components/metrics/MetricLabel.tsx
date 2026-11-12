import { Row, Text } from '@umami/react-zen';
import { Favicon } from '@/components/common/Favicon';
import { FilterLink } from '@/components/common/FilterLink';
import { TypeIcon } from '@/components/common/TypeIcon';
import {
  useCountryNames,
  useFormat,
  useLocale,
  useMessages,
  useRegionNames,
} from '@/components/hooks';
import { Share2 } from '@/components/icons';
import { GROUPED_DOMAINS } from '@/lib/constants';
import { decodePunycodeDomain } from '@/lib/format';

export interface MetricLabelProps {
  type: string;
  data: any;
  onClick?: () => void;
}

export function MetricLabel({ type, data }: MetricLabelProps) {
  switch (type) {
    case 'browser':
    case 'os':
      return <BrowserOsMetricLabel type={type} data={data} />;

    case 'channel':
      return <ChannelMetricLabel data={data} />;

    case 'city':
      return <CityMetricLabel data={data} />;

    case 'region':
      return <RegionMetricLabel data={data} />;

    case 'country':
      return <CountryMetricLabel data={data} />;

    case 'path':
    case 'entry':
    case 'exit':
      return <PathMetricLabel type={type} data={data} />;

    case 'fullPath':
      return <FullPathMetricLabel data={data} />;

    case 'device':
      return <DeviceMetricLabel data={data} />;

    case 'referrer':
      return <ReferrerMetricLabel data={data} />;

    case 'domain':
      return <DomainMetricLabel data={data} />;

    case 'language':
      return <LanguageMetricLabel data={data} />;

    default:
      return <DefaultMetricLabel type={type} data={data} />;
  }
}

function BrowserOsMetricLabel({
  type,
  data,
}: {
  type: 'browser' | 'os';
  data: MetricLabelProps['data'];
}) {
  const { formatValue } = useFormat();
  const { t, labels } = useMessages();
  const { label } = data;
  const formattedLabel = formatValue(label, type);
  const unknown = isUnknownValue(label) || formattedLabel === t(labels.unknown);

  return (
    <FilterLink
      type={type}
      value={unknown ? undefined : label}
      label={unknown ? t(labels.unknown) : formattedLabel}
      icon={<TypeIcon type={type} value={label} />}
    />
  );
}

function ChannelMetricLabel({ data }: Pick<MetricLabelProps, 'data'>) {
  const { t, labels } = useMessages();
  const { label } = data;

  return t(labels[label]);
}

function CityMetricLabel({ data }: Pick<MetricLabelProps, 'data'>) {
  const { formatCity } = useFormat();
  const { t, labels } = useMessages();
  const { label, country } = data;
  const unknown = isUnknownValue(label);

  return (
    <FilterLink
      type="city"
      value={unknown ? undefined : label}
      label={unknown ? t(labels.unknown) : formatCity(label, country)}
      icon={<TypeIcon type="country" value={country} unknown={unknown} />}
    />
  );
}

function RegionMetricLabel({ data }: Pick<MetricLabelProps, 'data'>) {
  const { locale } = useLocale();
  const { t, labels } = useMessages();
  const { getRegionName } = useRegionNames(locale);
  const { label, country } = data;
  const unknown = isUnknownValue(label);

  return (
    <FilterLink
      type="region"
      value={unknown ? undefined : label}
      label={unknown ? t(labels.unknown) : getRegionName(label, country)}
      icon={<TypeIcon type="country" value={country} unknown={unknown} />}
    />
  );
}

function CountryMetricLabel({ data }: Pick<MetricLabelProps, 'data'>) {
  const { formatValue } = useFormat();
  const { locale } = useLocale();
  const { t, labels } = useMessages();
  const { countryNames } = useCountryNames(locale);
  const { label } = data;
  const unknown = isUnknownValue(label);

  return (
    <FilterLink
      type="country"
      value={unknown ? undefined : (countryNames[label] && label) || label}
      label={unknown ? t(labels.unknown) : formatValue(label, 'country')}
      icon={<TypeIcon type="country" value={label} />}
    />
  );
}

function PathMetricLabel({ type, data }: MetricLabelProps) {
  const { t, labels } = useMessages();
  const { label, domain } = data;

  return (
    <FilterLink
      type={type === 'entry' || type === 'exit' ? 'path' : type}
      value={label}
      label={!label && t(labels.unknown)}
      externalUrl={
        domain ? `${domain?.startsWith('http') ? domain : `https://${domain}`}${label}` : null
      }
    />
  );
}

function FullPathMetricLabel({ data }: Pick<MetricLabelProps, 'data'>) {
  const { t, labels } = useMessages();
  const { label } = data;
  const text = label || `(${t(labels.unknown)})`;

  return <Text title={text}>{text}</Text>;
}

function DeviceMetricLabel({ data }: Pick<MetricLabelProps, 'data'>) {
  const { formatValue } = useFormat();
  const { t, labels } = useMessages();
  const { label } = data;
  const unknown = isUnknownValue(label);

  return (
    <FilterLink
      type="device"
      value={unknown ? undefined : label}
      label={unknown ? t(labels.unknown) : formatValue(label, 'device')}
      icon={<TypeIcon type="device" value={label} />}
    />
  );
}

function ReferrerMetricLabel({ data }: Pick<MetricLabelProps, 'data'>) {
  const { t, labels } = useMessages();
  const { label } = data;

  return (
    <FilterLink
      type="referrer"
      value={label}
      externalUrl={label ? `https://${label}` : null}
      label={!label ? t(labels.direct) : decodePunycodeDomain(label)}
      wrapEmptyLabel={false}
      icon={label ? <Favicon domain={label} /> : <Share2 size={16} />}
    />
  );
}

function DomainMetricLabel({ data }: Pick<MetricLabelProps, 'data'>) {
  const { t, labels } = useMessages();
  const { label } = data;

  if (label === 'Other') {
    return `(${t(labels.other)})`;
  }

  const name = GROUPED_DOMAINS.find(({ domain }) => domain === label)?.name;

  if (!name) {
    return null;
  }

  return (
    <Row alignItems="center" gap="3">
      <Favicon domain={label} />
      {name}
    </Row>
  );
}

function LanguageMetricLabel({ data }: Pick<MetricLabelProps, 'data'>) {
  const { formatValue } = useFormat();
  const { t, labels } = useMessages();
  const { label } = data;

  return isUnknownValue(label)
    ? `(${t(labels.unknown)})`
    : formatValue(label, 'language') || `(${t(labels.unknown)})`;
}

function DefaultMetricLabel({ type, data }: MetricLabelProps) {
  const { label } = data;

  return <FilterLink type={type} value={label} />;
}

function isUnknownValue(value: unknown) {
  return !value || (typeof value === 'string' && value.toLowerCase() === 'unknown');
}
