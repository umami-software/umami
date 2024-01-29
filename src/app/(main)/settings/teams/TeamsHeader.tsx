'use client';
import { Flexbox } from 'react-basics';
import PageHeader from 'components/layout/PageHeader';
import { ROLES } from 'lib/constants';
import { useUser } from 'components/hooks';
import { useMessages } from 'components/hooks';
import TeamsJoinButton from './TeamsJoinButton';
import TeamsAddButton from './TeamsAddButton';

export function TeamsHeader({ allowCreate = true }: { allowCreate?: boolean }) {
  const { formatMessage, labels } = useMessages();
  const { user } = useUser();

  return (
    <PageHeader title={formatMessage(labels.teams)}>
      <Flexbox gap={10}>
        <TeamsJoinButton />
        {allowCreate && user.role !== ROLES.viewOnly && <TeamsAddButton />}
      </Flexbox>
    </PageHeader>
  );
}

export default TeamsHeader;
