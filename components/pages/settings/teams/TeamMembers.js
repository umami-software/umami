import { Loading, useToasts } from 'react-basics';
import TeamMembersTable from 'components/pages/settings/teams/TeamMembersTable';
import useApi from 'hooks/useApi';
import useMessages from 'hooks/useMessages';

export function TeamMembers({ teamId, readOnly }) {
  const { showToast } = useToasts();
  const { get, useQuery } = useApi();
  const { formatMessage, messages } = useMessages();
  const { data, isLoading, refetch } = useQuery(['teams:users', teamId], () =>
    get(`/teams/${teamId}/users`),
  );

  if (isLoading) {
    return <Loading icon="dots" style={{ minHeight: 300 }} />;
  }

  const handleSave = async () => {
    await refetch();
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
  };

  return (
    <>
      <TeamMembersTable onSave={handleSave} data={data} readOnly={readOnly} />
    </>
  );
}

export default TeamMembers;
