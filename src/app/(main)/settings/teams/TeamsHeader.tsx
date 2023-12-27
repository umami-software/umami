'use client';
import { Flexbox } from 'react-basics';
import PageHeader from 'components/layout/PageHeader';
import { ROLES } from 'lib/constants';
import useUser from 'components/hooks/useUser';
import useMessages from 'components/hooks/useMessages';
import TeamsJoinButton from './TeamsJoinButton';
import TeamsAddButton from './TeamsAddButton';

export function TeamsHeader() {
  const { formatMessage, labels } = useMessages();
  const { user } = useUser();

  return (
    <PageHeader title={formatMessage(labels.teams)}>
      <Flexbox gap={10}>
        <TeamsJoinButton />
        {user.role !== ROLES.viewOnly && <TeamsAddButton />}
      </Flexbox>
    </PageHeader>
  );
}

export default TeamsHeader;
