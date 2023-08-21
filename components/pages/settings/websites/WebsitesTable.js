import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import Link from 'next/link';
import { Button, Text, Icon, Icons } from 'react-basics';
import SettingsTable from 'components/common/SettingsTable';
import useMessages from 'hooks/useMessages';
import useConfig from 'hooks/useConfig';
import useUser from 'hooks/useUser';

export function WebsitesTable({
  data = [],
  filterValue,
  onFilterChange,
  onPageChange,
  onPageSizeChange,
  showTeam,
  showEditButton,
}) {
  const { formatMessage, labels, messages } = useMessages();
  const { openExternal } = useConfig();
  const { user } = useUser();

  const showTable = data && (filterValue || data?.data.length !== 0);

  const teamColumns = [
    { name: 'teamName', label: formatMessage(labels.teamName) },
    { name: 'owner', label: formatMessage(labels.owner) },
  ];

  const columns = [
    { name: 'name', label: formatMessage(labels.name) },
    { name: 'domain', label: formatMessage(labels.domain) },
    ...(showTeam ? teamColumns : []),
    { name: 'action', label: ' ' },
  ];

  return (
    <>
      {showTable && (
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
            const {
              id,
              teamWebsite,
              user: { username, id: ownerId },
            } = row;
            if (showTeam) {
              row.teamName = teamWebsite[0]?.team.name;
              row.owner = username;
            }

            return (
              <>
                {showEditButton && (!showTeam || ownerId === user.id) && (
                  <Link href={`/settings/websites/${id}`}>
                    <Button>
                      <Icon>
                        <Icons.Edit />
                      </Icon>
                      <Text>{formatMessage(labels.edit)}</Text>
                    </Button>
                  </Link>
                )}
                <Link href={`/websites/${id}`} target={openExternal ? '_blank' : null}>
                  <Button>
                    <Icon>
                      <Icons.External />
                    </Icon>
                    <Text>{formatMessage(labels.view)}</Text>
                  </Button>
                </Link>
              </>
            );
          }}
        </SettingsTable>
      )}
      {!showTable && <EmptyPlaceholder message={formatMessage(messages.noDataAvailable)} />}
    </>
  );
}

export default WebsitesTable;
