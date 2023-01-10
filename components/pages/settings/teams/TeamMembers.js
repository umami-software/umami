import { Loading } from 'react-basics';
import useApi from 'hooks/useApi';
import TeamMembersTable from 'components/pages/settings/teams/TeamMembersTable';

export default function TeamMembers({ teamId }) {
  const { get, useQuery } = useApi();
  const { data, isLoading } = useQuery(['team-members', teamId], () =>
    get(`/teams/${teamId}/users`),
  );

  if (isLoading) {
    return <Loading icon="dots" position="block" />;
  }

  return <TeamMembersTable data={data} />;
}
