import FilterLink from 'components/common/FilterLink';
import FilterButtons from 'components/common/FilterButtons';
import MetricsTable from './MetricsTable';
import useMessages from 'components/hooks/useMessages';
import usePageQuery from 'components/hooks/usePageQuery';
import { emptyFilter } from 'lib/filters';

export function PagesTable({ websiteId, showFilters, ...props }) {
  const {
    router,
    resolveUrl,
    query: { view = 'url' },
  } = usePageQuery();
  const { formatMessage, labels } = useMessages();

  const handleSelect = key => {
    router.push(resolveUrl({ view: key }), null, { shallow: true });
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
    return <FilterLink id={view} value={x} label={!x && formatMessage(labels.none)} />;
  };

  return (
    <>
      {showFilters && <FilterButtons items={buttons} selectedKey={view} onSelect={handleSelect} />}
      <MetricsTable
        {...props}
        title={formatMessage(labels.pages)}
        type={view}
        metric={formatMessage(labels.views)}
        websiteId={websiteId}
        dataFilter={emptyFilter}
        renderLabel={renderLink}
      />
    </>
  );
}

export default PagesTable;
