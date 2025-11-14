import { Row } from '@umami/react-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { ROLES } from '@/lib/constants';
import { useLoginQuery, useMessages } from '@/components/hooks';
import { TeamsJoinButton } from './TeamsJoinButton';
import { TeamsAddButton } from './TeamsAddButton';

export function TeamsHeader({
  allowCreate = true,
  allowJoin = true,
}: {
  allowCreate?: boolean;
  allowJoin?: boolean;
}) {
  const { formatMessage, labels } = useMessages();
  const { user } = useLoginQuery();

  return (
    <PageHeader title={formatMessage(labels.teams)}>
      <Row gap="3">
        {allowJoin && user.role !== ROLES.viewOnly && <TeamsJoinButton />}
        {allowCreate && user.role !== ROLES.viewOnly && <TeamsAddButton />}
      </Row>
    </PageHeader>
  );
}
