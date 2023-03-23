import { Loading, useToast } from 'react-basics';
import TeamMembersTable from 'components/pages/settings/teams/TeamMembersTable';
import useApi from 'hooks/useApi';
import useMessages from 'hooks/useMessages';

export default function TeamMembers({ teamId, readOnly }) {
  const { toast, showToast } = useToast();
  const { get, useQuery } = useApi();
  const { formatMessage, labels } = useMessages();
  const { data, isLoading, refetch } = useQuery(['teams:users', teamId], () =>
    get(`/teams/${teamId}/users`),
  );

  if (isLoading) {
    return <Loading icon="dots" position="block" />;
  }

  const handleSave = async () => {
    await refetch();
    showToast({ message: formatMessage(labels.saved), variant: 'success' });
  };

  return (
    <>
      {toast}
      <TeamMembersTable onSave={handleSave} data={data} readOnly={readOnly} />
    </>
  );
}
