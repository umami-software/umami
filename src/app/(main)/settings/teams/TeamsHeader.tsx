import { Flexbox } from 'react-basics';
import PageHeader from 'components/layout/PageHeader';
import { ROLES } from 'lib/constants';
import { useLogin, useMessages } from 'components/hooks';
import TeamsJoinButton from './TeamsJoinButton';
import TeamsAddButton from './TeamsAddButton';

export function TeamsHeader({ allowCreate = true }: { allowCreate?: boolean }) {
  const { formatMessage, labels } = useMessages();
  const { user } = useLogin();
  const cloudMode = !!process.env.cloudMode;

  return (
    <PageHeader title={formatMessage(labels.teams)}>
      <Flexbox gap={10}>
        {!cloudMode && <TeamsJoinButton />}
        {allowCreate && user.role !== ROLES.viewOnly && <TeamsAddButton />}
      </Flexbox>
    </PageHeader>
  );
}

export default TeamsHeader;
