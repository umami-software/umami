import MetricsTable, { MetricsTableProps } from './MetricsTable';
import FilterLink from 'components/common/FilterLink';
import { useMessages } from 'components/hooks';
import { Flexbox } from 'react-basics';

export function TagsTable(props: MetricsTableProps) {
  const { formatMessage, labels } = useMessages();

  const renderLink = ({ x: tag }) => {
    return (
      <Flexbox alignItems="center">
        <FilterLink id="tag" value={tag} label={!tag && formatMessage(labels.none)} />
      </Flexbox>
    );
  };

  return (
    <>
      <MetricsTable
        {...props}
        title={formatMessage(labels.tags)}
        type="tag"
        metric={formatMessage(labels.views)}
        renderLabel={renderLink}
      />
    </>
  );
}

export default TagsTable;
