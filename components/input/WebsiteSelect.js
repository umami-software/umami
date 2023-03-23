import { Dropdown, Item } from 'react-basics';
import useApi from 'hooks/useApi';
import useMessages from 'hooks/useMessages';

export default function WebsiteSelect({ websiteId, onSelect }) {
  const { formatMessage, labels } = useMessages();
  const { get, useQuery } = useApi();
  const { data } = useQuery(['websites:me'], () => get('/me/websites'));

  const renderValue = value => {
    return data?.find(({ id }) => id === value)?.name;
  };

  return (
    <Dropdown
      items={data}
      value={websiteId}
      renderValue={renderValue}
      onChange={onSelect}
      alignment="end"
      placeholder={formatMessage(labels.selectWebsite)}
      style={{ width: 200 }}
    >
      {({ id, name }) => <Item key={id}>{name}</Item>}
    </Dropdown>
  );
}
