import { Dropdown, Item } from 'react-basics';
import useApi from 'components/hooks/useApi';
import useMessages from 'components/hooks/useMessages';

export function WebsiteSelect({ websiteId, onSelect }) {
  const { formatMessage, labels } = useMessages();
  const { get, useQuery } = useApi();
  const { data } = useQuery(['websites:me'], () => get('/me/websites'));

  const renderValue = value => {
    return data?.data?.find(({ id }) => id === value)?.name;
  };

  return (
    <Dropdown
      items={data?.data}
      value={websiteId}
      renderValue={renderValue}
      onChange={onSelect}
      alignment="end"
      placeholder={formatMessage(labels.selectWebsite)}
    >
      {({ id, name }) => <Item key={id}>{name}</Item>}
    </Dropdown>
  );
}

export default WebsiteSelect;
