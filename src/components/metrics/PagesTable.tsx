import { FilterButtons } from '@/components/input/FilterButtons';
import { FilterLink } from '@/components/common/FilterLink';
import { useMessages, useNavigation, useWebsite } from '@/components/hooks';
import { emptyFilter } from '@/lib/filters';
import { MetricsTable, MetricsTableProps } from './MetricsTable';

export interface PagesTableProps extends MetricsTableProps {
  type: string;
  allowFilter?: boolean;
}

export function PagesTable({ type, allowFilter, ...props }: PagesTableProps) {
  const { router, updateParams } = useNavigation();
  const { formatMessage, labels } = useMessages();
  const { domain } = useWebsite();

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
        id={type === 'entry' || type === 'exit' ? 'path' : type}
        value={x}
        label={!x && formatMessage(labels.none)}
        externalUrl={
          type !== 'title'
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
      type={type}
      metric={formatMessage(labels.visitors)}
      dataFilter={emptyFilter}
      renderLabel={renderLink}
    >
      {allowFilter && <FilterButtons items={buttons} value={type} onChange={handleChange} />}
    </MetricsTable>
  );
}
