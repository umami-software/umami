import useMessages from 'hooks/useMessages';
import useUser from 'hooks/useUser';
import Link from 'next/link';
import { Button, Icon, Icons, Text } from 'react-basics';
import TeamWebsiteRemoveButton from './TeamWebsiteRemoveButton';
import SettingsTable from 'components/common/SettingsTable';
import useConfig from 'hooks/useConfig';

export function TeamWebsitesTable({
  data = [],
  onSave,
  filterValue,
  onFilterChange,
  onPageChange,
  onPageSizeChange,
}) {
  const { formatMessage, labels } = useMessages();
  const { openExternal } = useConfig();

  const { user } = useUser();
  const columns = [
    { name: 'name', label: formatMessage(labels.name) },
    { name: 'domain', label: formatMessage(labels.domain) },
    { name: 'action', label: ' ' },
  ];

  return (
    <SettingsTable
      columns={columns}
      data={data}
      showSearch={true}
      showPaging={true}
      onFilterChange={onFilterChange}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      filterValue={filterValue}
    >
      {row => {
        const { id: teamId, teamUser } = row.teamWebsite[0].team;
        const { id: websiteId, name, domain, userId } = row;
        const owner = teamUser[0];
        const canRemove = user.id === userId || user.id === owner.userId;

        row.name = name;
        row.domain = domain;

        return (
          <>
            <Link href={`/websites/${websiteId}`} target={openExternal ? '_blank' : null}>
              <Button>
                <Icon>
                  <Icons.External />
                </Icon>
                <Text>{formatMessage(labels.view)}</Text>
              </Button>
            </Link>
            {canRemove && (
              <TeamWebsiteRemoveButton
                teamId={teamId}
                websiteId={websiteId}
                onSave={onSave}
              ></TeamWebsiteRemoveButton>
            )}
          </>
        );
      }}
    </SettingsTable>
  );
}

export default TeamWebsitesTable;
