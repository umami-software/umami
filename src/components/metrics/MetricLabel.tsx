import { Row } from '@umami/react-zen';
import {
  useCountryNames,
  useLocale,
  useMessages,
  useRegionNames,
  useFormat,
} from '@/components/hooks';
import { FilterLink } from '@/components/common/FilterLink';
import { TypeIcon } from '@/components/common/TypeIcon';
import { Favicon } from '@/components/common/Favicon';
import { GROUPED_DOMAINS } from '@/lib/constants';

export interface MetricLabelProps {
  type: string;
  data: any;
  onClick?: () => void;
}

export function MetricLabel({ type, data }: MetricLabelProps) {
  const { formatMessage, labels } = useMessages();
  const { formatValue, formatCity } = useFormat();
  const { locale } = useLocale();
  const { countryNames } = useCountryNames(locale);
  const { getRegionName } = useRegionNames(locale);

  const { label, country, domain } = data;

  switch (type) {
    case 'browser':
    case 'os':
      return (
        <FilterLink
          type={type}
          value={label}
          label={formatValue(label, type)}
          icon={<TypeIcon type={type} value={label} />}
        />
      );

    case 'channel':
      return formatMessage(labels[label]);

    case 'city':
      return (
        <FilterLink
          type="city"
          value={label}
          label={formatCity(label, country)}
          icon={
            country && (
              <img
                src={`${process.env.basePath || ''}/images/country/${
                  country?.toLowerCase() || 'xx'
                }.png`}
                alt={country}
              />
            )
          }
        />
      );

    case 'region':
      return (
        <FilterLink
          type="region"
          value={label}
          label={getRegionName(label, country)}
          icon={<TypeIcon type="country" value={country} />}
        />
      );

    case 'country':
      return (
        <FilterLink
          type="country"
          value={(countryNames[label] && label) || label}
          label={formatValue(label, 'country')}
          icon={<TypeIcon type="country" value={label} />}
        />
      );

    case 'path':
    case 'entry':
    case 'exit':
      return (
        <FilterLink
          type={type === 'entry' || type === 'exit' ? 'path' : type}
          value={label}
          label={!label && formatMessage(labels.none)}
          externalUrl={
            domain ? `${domain?.startsWith('http') ? domain : `https://${domain}`}${label}` : null
          }
        />
      );

    case 'device':
      return (
        <FilterLink
          type="device"
          value={labels[label] && label}
          label={formatValue(label, 'device')}
          icon={<TypeIcon type="device" value={label} />}
        />
      );

    case 'referrer':
      return (
        <FilterLink
          type="referrer"
          value={label}
          externalUrl={`https://${label}`}
          label={!label && formatMessage(labels.none)}
          icon={<Favicon domain={label} />}
        />
      );

    case 'domain':
      if (label === 'Other') {
        return `(${formatMessage(labels.other)})`;
      } else {
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

    case 'language':
      return formatValue(label, 'language');

    default:
      return (
        <FilterLink
          type={type}
          value={label}
        />
      );
  }
}
