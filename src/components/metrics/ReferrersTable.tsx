import { Favicon } from '@/components/common/Favicon';
import { FilterButtons } from '@/components/input/FilterButtons';
import { FilterLink } from '@/components/common/FilterLink';
import { useMessages, useNavigation } from '@/components/hooks';
import { GROUPED_DOMAINS } from '@/lib/constants';
import { emptyFilter } from '@/lib/filters';
import { Row } from '@umami/react-zen';
import { MetricsTable, MetricsTableProps } from './MetricsTable';

export interface ReferrersTableProps extends MetricsTableProps {
  allowFilter?: boolean;
}

export function ReferrersTable({ allowFilter, ...props }: ReferrersTableProps) {
  const {
    router,
    updateParams,
    query: { view = 'referrer' },
  } = useNavigation();
  const { formatMessage, labels } = useMessages();

  const handleSelect = (key: any) => {
    router.push(updateParams({ view: key }));
  };

  const buttons = [
    {
      id: 'referrer',
      label: formatMessage(labels.domain),
    },
    {
      id: 'grouped',
      label: formatMessage(labels.grouped),
    },
  ];

  const renderLink = ({ x: referrer }) => {
    if (view === 'grouped') {
      if (referrer === 'Other') {
        return `(${formatMessage(labels.other)})`;
      } else {
        return (
          <Row alignItems="center" gap="3">
            <Favicon domain={referrer} />
            {GROUPED_DOMAINS.find(({ domain }) => domain === referrer)?.name}
          </Row>
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

  return (
    <MetricsTable
      {...props}
      title={formatMessage(labels.referrers)}
      type={view}
      metric={formatMessage(labels.visitors)}
      dataFilter={emptyFilter}
      renderLabel={renderLink}
    >
      {allowFilter && <FilterButtons items={buttons} value={view} onChange={handleSelect} />}
    </MetricsTable>
  );
}
