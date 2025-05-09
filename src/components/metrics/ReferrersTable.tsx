import FilterLink from '@/components/common/FilterLink';
import Favicon from '@/components/common/Favicon';
import { useMessages, useNavigation } from '@/components/hooks';
import MetricsTable, { MetricsTableProps } from './MetricsTable';
import FilterButtons from '@/components/common/FilterButtons';
import thenby from 'thenby';
import { GROUPED_DOMAINS } from '@/lib/constants';
import { Flexbox } from 'react-basics';

export interface ReferrersTableProps extends MetricsTableProps {
  allowFilter?: boolean;
}

export function ReferrersTable({ allowFilter, ...props }: ReferrersTableProps) {
  const {
    router,
    renderUrl,
    query: { view = 'referrer' },
  } = useNavigation();
  const { formatMessage, labels } = useMessages();

  const handleSelect = (key: any) => {
    router.push(renderUrl({ view: key }), { scroll: false });
  };

  const buttons = [
    {
      label: formatMessage(labels.domain),
      key: 'referrer',
    },
    {
      label: formatMessage(labels.grouped),
      key: 'grouped',
    },
  ];

  const renderLink = ({ x: referrer }) => {
    if (view === 'grouped') {
      if (referrer === '_other') {
        return `(${formatMessage(labels.other)})`;
      } else {
        return (
          <Flexbox alignItems="center" gap={10}>
            <Favicon domain={referrer} />
            {GROUPED_DOMAINS.find(({ domain }) => domain === referrer)?.name}
          </Flexbox>
        );
      }
    }

    return (
      <FilterLink
        id="referrer"
        value={referrer}
        externalUrl={`https://${referrer}`}
        label={!referrer && formatMessage(labels.none)}
      >
        <Favicon domain={referrer} />
      </FilterLink>
    );
  };

  const getDomain = (x: string) => {
    for (const { domain, match } of GROUPED_DOMAINS) {
      if (Array.isArray(match) ? match.some(str => x.includes(str)) : x.includes(match)) {
        return domain;
      }
    }
    return '_other';
  };

  const groupedFilter = (data: any[]) => {
    const groups = { _other: 0 };

    for (const { x, y } of data) {
      const domain = getDomain(x);
      if (!groups[domain]) {
        groups[domain] = 0;
      }
      groups[domain] += +y;
    }

    return Object.keys(groups)
      .map((key: any) => ({ x: key, y: groups[key] }))
      .sort(thenby.firstBy('y', -1));
  };

  return (
    <>
      <MetricsTable
        {...props}
        title={formatMessage(labels.referrers)}
        type="referrer"
        metric={formatMessage(labels.visitors)}
        dataFilter={view === 'grouped' ? groupedFilter : undefined}
        renderLabel={renderLink}
      >
        {allowFilter && (
          <FilterButtons items={buttons} selectedKey={view} onSelect={handleSelect} />
        )}
      </MetricsTable>
    </>
  );
}

export default ReferrersTable;
