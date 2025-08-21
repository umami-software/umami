import { WebsiteContext } from '@/app/(main)/websites/WebsiteProvider';
import { FilterButtons } from '@/components/input/FilterButtons';
import { FilterLink } from '@/components/common/FilterLink';
import { useMessages, useNavigation } from '@/components/hooks';
import { emptyFilter } from '@/lib/filters';
import { useContext } from 'react';
import { MetricsTable, MetricsTableProps } from './MetricsTable';

export interface PagesTableProps extends MetricsTableProps {
  allowFilter?: boolean;
}

export function PagesTable({ allowFilter, ...props }: PagesTableProps) {
  const {
    router,
    updateParams,
    query: { view = 'path' },
  } = useNavigation();
  const { formatMessage, labels } = useMessages();
  const { domain } = useContext(WebsiteContext);

  const handleChange = (id: any) => {
    router.push(updateParams({ view: id }));
  };

  const buttons = [
    {
      id: 'path',
      label: formatMessage(labels.path),
    },
    {
      id: 'entry',
      label: formatMessage(labels.entry),
    },
    {
      id: 'exit',
      label: formatMessage(labels.exit),
    },
    {
      id: 'title',
      label: formatMessage(labels.title),
    },
  ];

  const renderLink = ({ x }) => {
    return (
      <FilterLink
        id={view === 'entry' || view === 'exit' ? 'path' : view}
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
      {allowFilter && <FilterButtons items={buttons} value={view} onChange={handleChange} />}
    </MetricsTable>
  );
}
