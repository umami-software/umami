import { Loading } from 'react-basics';
import useApi from 'hooks/useApi';
import WebsitesTable from 'components/pages/settings/websites/WebsitesTable';
import useMessages from 'hooks/useMessages';

export default function UserWebsites({ userId }) {
  const { formatMessage, messages } = useMessages();
  const { get, useQuery } = useApi();
  const { data, isLoading } = useQuery(['user:websites', userId], () =>
    get(`/users/${userId}/websites`),
  );
  const hasData = data && data.length !== 0;

  if (isLoading) {
    return <Loading icon="dots" position="block" />;
  }

  return (
    <div>
      {hasData && <WebsitesTable data={data} />}
      {!hasData && formatMessage(messages.noData)}
    </div>
  );
}
