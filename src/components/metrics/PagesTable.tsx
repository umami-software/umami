import FilterLink from 'components/common/FilterLink';
import FilterButtons from 'components/common/FilterButtons';
import MetricsTable, { MetricsTableProps } from './MetricsTable';
import { useMessages } from 'components/hooks';
import { useNavigation } from 'components/hooks';
import { emptyFilter } from 'lib/filters';
import { useContext } from 'react';
import { WebsiteContext } from 'app/(main)/websites/[websiteId]/WebsiteProvider';

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
    router.push(renderUrl({ view: key }), { scroll: true });
  };

  const buttons = [
    {
      label: 'URL',
      key: 'url',
    },
    {
      label: formatMessage(labels.title),
      key: 'title',
    },
  ];

  const renderLink = ({ x }) => {
    return (
      <FilterLink
        id={view}
        value={x}
        label={!x && formatMessage(labels.none)}
        externalUrl={
          view === 'url' ? `${domain.startsWith('http') ? domain : `https://${domain}`}${x}` : null
        }
      />
    );
  };

  return (
    <MetricsTable
      {...props}
      title={formatMessage(labels.pages)}
      type={view}
      metric={formatMessage(labels.views)}
      dataFilter={emptyFilter}
      renderLabel={props.renderLabel || renderLink}
    >
      {allowFilter && <FilterButtons items={buttons} selectedKey={view} onSelect={handleSelect} />}
    </MetricsTable>
  );
}

export default PagesTable;
