import { GridColumn, GridTable, Icon, Icons, Text } from 'react-basics';
import LinkButton from 'components/common/LinkButton';
import { useMessages, useLogin, useTeamUrl } from 'components/hooks';
import { REPORT_TYPES } from 'lib/constants';
import ReportDeleteButton from './ReportDeleteButton';

export function ReportsTable({ data = [], showDomain }: { data: any[]; showDomain?: boolean }) {
  const { formatMessage, labels } = useMessages();
  const { user } = useLogin();
  const { renderTeamUrl } = useTeamUrl();

  return (
    <GridTable data={data}>
      <GridColumn name="name" label={formatMessage(labels.name)} />
      <GridColumn name="description" label={formatMessage(labels.description)} />
      <GridColumn name="type" label={formatMessage(labels.type)}>
        {row => {
          return formatMessage(
            labels[Object.keys(REPORT_TYPES).find(key => REPORT_TYPES[key] === row.type)],
          );
        }}
      </GridColumn>
      {showDomain && (
        <GridColumn name="domain" label={formatMessage(labels.domain)}>
          {row => row?.website?.domain}
        </GridColumn>
      )}
      <GridColumn name="action" label="" alignment="end">
        {row => {
          const { id, name, userId, website } = row;
          return (
            <>
              {(user.id === userId || user.id === website?.userId) && (
                <ReportDeleteButton reportId={id} reportName={name} />
              )}
              <LinkButton href={renderTeamUrl(`/reports/${id}`)}>
                <Icon>
                  <Icons.ArrowRight />
                </Icon>
                <Text>{formatMessage(labels.view)}</Text>
              </LinkButton>
            </>
          );
        }}
      </GridColumn>
    </GridTable>
  );
}

export default ReportsTable;
