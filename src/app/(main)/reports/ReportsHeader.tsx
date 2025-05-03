import { SectionHeader } from '@/components/common/SectionHeader';
import { Icon, Icons, Text } from '@umami/react-zen';
import { useLoginQuery, useMessages, useNavigation } from '@/components/hooks';
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
            <Icons.Plus />
          </Icon>
          <Text>{formatMessage(labels.createReport)}</Text>
        </LinkButton>
      )}
    </SectionHeader>
  );
}
