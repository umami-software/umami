import FilterLink from 'components/common/FilterLink';
import FilterButtons from 'components/common/FilterButtons';
import MetricsTable from './MetricsTable';
import useMessages from 'hooks/useMessages';
import usePageQuery from 'hooks/usePageQuery';

export default function PagesTable({ websiteId, showFilters, ...props }) {
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
      label: formatMessage(labels.url),
      key: 'url',
    },
    {
      label: formatMessage(labels.title),
      key: 'title',
    },
  ];

  const renderLink = ({ x }) => {
    return <FilterLink id={view} value={x || `(${formatMessage(labels.none)})`} />;
  };

  return (
    <>
      {showFilters && <FilterButtons items={buttons} selectedKey={view} onSelect={handleSelect} />}
      <MetricsTable
        title={formatMessage(labels.pages)}
        type={view}
        metric={formatMessage(labels.views)}
        websiteId={websiteId}
        renderLabel={renderLink}
        {...props}
      />
    </>
  );
}
