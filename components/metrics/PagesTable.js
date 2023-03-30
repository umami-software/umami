import FilterLink from 'components/common/FilterLink';
import MetricsTable from './MetricsTable';
import useMessages from 'hooks/useMessages';

export default function PagesTable({ websiteId, ...props }) {
  const { formatMessage, labels } = useMessages();

  const renderLink = ({ x: url }) => {
    return <FilterLink id="url" value={url} />;
  };

  return (
    <>
      <MetricsTable
        title={formatMessage(labels.pages)}
        type="url"
        metric={formatMessage(labels.views)}
        websiteId={websiteId}
        renderLabel={renderLink}
        {...props}
      />
    </>
  );
}
