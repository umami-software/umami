import { WebsiteContext } from '@/app/(main)/websites/[websiteId]/WebsiteProvider';
import FilterButtons from '@/components/common/FilterButtons';
import FilterLink from '@/components/common/FilterLink';
import { useMessages, useNavigation } from '@/components/hooks';
import { emptyFilter } from '@/lib/filters';
import { useContext } from 'react';
import MetricsTable, { MetricsTableProps } from './MetricsTable';

export interface PagesTableProps extends MetricsTableProps {
  allowFilter?: boolean;
}

export function PagesTable({ allowFilter, ...props }: PagesTableProps) {
  const {
    router,
    renderUrl,
    query: { view = 'url' },
  } = useNavigation();
  const { formatMessage, labels } = useMessages();
  const { domain } = useContext(WebsiteContext);

  const handleSelect = (key: any) => {
    router.push(renderUrl({ view: key }), { scroll: false });
  };

  const buttons = [
    {
      label: formatMessage(labels.path),
      key: 'url',
    },
    {
      label: formatMessage(labels.entry),
      key: 'entry',
    },
    {
      label: formatMessage(labels.exit),
      key: 'exit',
    },
    {
      label: formatMessage(labels.title),
      key: 'title',
    },
  ];

  const renderLink = ({ x }) => {
    return (
      <FilterLink
        id={view === 'entry' || view === 'exit' ? 'url' : view}
        value={x}
        label={!x && formatMessage(labels.none)}
        externalUrl={
          view !== 'title'
            ? `${domain.startsWith('http') ? domain : `https://${domain}`}${x}`
            : null
        }
      />
    );
  };

  return (
    <MetricsTable
      {...props}
      title={formatMessage(labels.pages)}
      type={view}
      metric={formatMessage(labels.visitors)}
      dataFilter={emptyFilter}
      renderLabel={renderLink}
    >
      {allowFilter && <FilterButtons items={buttons} selectedKey={view} onSelect={handleSelect} />}
    </MetricsTable>
  );
}

export default PagesTable;
