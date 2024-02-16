import PageHeader from 'components/layout/PageHeader';
import { Icon, Icons, Text } from 'react-basics';
import { useMessages, useTeamUrl } from 'components/hooks';
import LinkButton from 'components/common/LinkButton';

export function ReportsHeader() {
  const { formatMessage, labels } = useMessages();
  const { renderTeamUrl } = useTeamUrl();

  return (
    <PageHeader title={formatMessage(labels.reports)}>
      <LinkButton href={renderTeamUrl('/reports/create')} variant="primary">
        <Icon>
          <Icons.Plus />
        </Icon>
        <Text>{formatMessage(labels.createReport)}</Text>
      </LinkButton>
    </PageHeader>
  );
}

export default ReportsHeader;
