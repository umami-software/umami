import { Row } from '@umami/react-zen';
import { PageHeader } from '@/components/common/PageHeader';
import { useLoginQuery, useMessages } from '@/components/hooks';
import { ROLES } from '@/lib/constants';
import { TeamsAddButton } from './TeamsAddButton';
import { TeamsJoinButton } from './TeamsJoinButton';

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
        {allowJoin && <TeamsJoinButton />}
        {allowCreate && user.role !== ROLES.viewOnly && <TeamsAddButton />}
      </Row>
    </PageHeader>
  );
}
