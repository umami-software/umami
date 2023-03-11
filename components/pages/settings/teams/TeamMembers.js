import { messages } from 'components/messages';
import TeamMembersTable from 'components/pages/settings/teams/TeamMembersTable';
import useApi from 'hooks/useApi';
import { Loading, useToast } from 'react-basics';
import { useIntl } from 'react-intl';

export default function TeamMembers({ teamId, readOnly }) {
  const { toast, showToast } = useToast();
  const { get, useQuery } = useApi();
  const { formatMessage } = useIntl();
  const { data, isLoading, refetch } = useQuery(['teams:users', teamId], () =>
    get(`/teams/${teamId}/users`),
  );

  if (isLoading) {
    return <Loading icon="dots" position="block" />;
  }

  const handleSave = async () => {
    await refetch();
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
  };

  return (
    <>
      {toast}
      <TeamMembersTable onSave={handleSave} data={data} readOnly={readOnly} />
    </>
  );
}
