import Link from 'next/link';
import { Button, Text, Icon, Icons, GridTable, GridColumn } from 'react-basics';
import SettingsTable from 'components/common/SettingsTable';
import Empty from 'components/common/Empty';
import useMessages from 'components/hooks/useMessages';
import useUser from 'components/hooks/useUser';
import DataTable, { DataTableStyles } from 'components/common/DataTable';

export function WebsitesTable({
  data = [],
  filterValue,
  showTeam,
  showEditButton,
  openExternal = false,
  onChange,
}) {
  const { formatMessage, labels } = useMessages();
  const { user } = useUser();

  const showTable = data && (filterValue || data?.data?.length !== 0);

  return (
    <DataTable onChange={onChange}>
      {showTable && (
        <GridTable data={data?.data}>
          <GridColumn name="name" label={formatMessage(labels.name)} />
          <GridColumn name="domain" label={formatMessage(labels.domain)} />
          {showTeam && (
            <GridColumn name="teamName" label={formatMessage(labels.teamName)}>
              {row => row.teamWebsite[0]?.team.name}
            </GridColumn>
          )}
          {showTeam && (
            <GridColumn name="owner" label={formatMessage(labels.owner)}>
              {row => row.user.username}
            </GridColumn>
          )}
          <GridColumn name="action" label=" " className={DataTableStyles.action}>
            {row => {
              const {
                id,
                user: { id: ownerId },
              } = row;

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
          </GridColumn>
        </GridTable>
      )}
    </DataTable>
  );
}

export function WebsitesTable2({
  data = [],
  filterValue,
  onFilterChange,
  onPageChange,
  onPageSizeChange,
  showTeam,
  showEditButton,
  openExternal = false,
}) {
  const { formatMessage, labels } = useMessages();
  const { user } = useUser();

  const showTable = data && (filterValue || data?.data?.length !== 0);

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
      {!showTable && <Empty />}
    </>
  );
}

export default WebsitesTable;
