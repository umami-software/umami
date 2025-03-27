import { Row } from '@umami/react-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { ROLES } from '@/lib/constants';
import { useLoginQuery, useMessages } from '@/components/hooks';
import { TeamsJoinButton } from './TeamsJoinButton';
import { TeamsAddButton } from './TeamsAddButton';

export function TeamsHeader({ allowCreate = true }: { allowCreate?: boolean }) {
  const { formatMessage, labels } = useMessages();
  const { user } = useLoginQuery();
  const cloudMode = !!process.env.cloudMode;

  return (
    <PageHeader title={formatMessage(labels.teams)}>
      <Row gap="3">
        {!cloudMode && <TeamsJoinButton />}
        {allowCreate && user.role !== ROLES.viewOnly && <TeamsAddButton />}
      </Row>
    </PageHeader>
  );
}
