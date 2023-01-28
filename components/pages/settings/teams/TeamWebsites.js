import { Loading } from 'react-basics';
import { useIntl } from 'react-intl';
import useApi from 'hooks/useApi';
import WebsitesTable from 'components/pages/settings/websites/WebsitesTable';
import { messages } from 'components/messages';

export default function TeamWebsites({ teamId }) {
  const { formatMessage } = useIntl();
  const { get, useQuery } = useApi();
  const { data, isLoading } = useQuery(['teams/websites', teamId], () =>
    get(`/teams/${teamId}/websites`),
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
