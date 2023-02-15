import { useIntl } from 'react-intl';
import { Dropdown, Item } from 'react-basics';
import { labels } from 'components/messages';
import useApi from 'hooks/useApi';

export default function WebsiteSelect({ websiteId, onSelect }) {
  const { formatMessage } = useIntl();
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
      {item => <Item key={item.id}>{item.name}</Item>}
    </Dropdown>
  );
}
