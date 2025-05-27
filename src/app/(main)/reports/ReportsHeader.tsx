import { SectionHeader } from '@/components/common/SectionHeader';
import { Icon, Text } from '@umami/react-zen';
import { useLoginQuery, useMessages, useNavigation } from '@/components/hooks';
import { Plus } from '@/components/icons';
import { LinkButton } from '@/components/common/LinkButton';
import { ROLES } from '@/lib/constants';

export function ReportsHeader() {
  const { formatMessage, labels } = useMessages();
  const { renderTeamUrl } = useNavigation();
  const { user } = useLoginQuery();
  const canEdit = user.role !== ROLES.viewOnly;

  return (
    <SectionHeader title={formatMessage(labels.reports)}>
      {canEdit && (
        <LinkButton href={renderTeamUrl('/reports/create')} variant="primary">
          <Icon>
            <Plus />
          </Icon>
          <Text>{formatMessage(labels.createReport)}</Text>
        </LinkButton>
      )}
    </SectionHeader>
  );
}
