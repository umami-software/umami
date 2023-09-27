import PageHeader from 'components/layout/PageHeader';
import WebsiteAddForm from 'components/pages/settings/websites/WebsiteAddForm';
import WebsitesTable from 'components/pages/settings/websites/WebsitesTable';
import useMessages from 'components/hooks/useMessages';
import useUser from 'components/hooks/useUser';
import { ROLES } from 'lib/constants';
import { Button, Icon, Icons, Modal, ModalTrigger, Text, useToasts } from 'react-basics';
import useApi from 'components/hooks/useApi';
import DataTable from 'components/common/DataTable';
import useFilterQuery from 'components/hooks/useFilterQuery';

export function WebsitesList({
  showTeam,
  showEditButton = true,
  showHeader = true,
  includeTeams,
  onlyTeams,
}) {
  const { formatMessage, labels, messages } = useMessages();
  const { user } = useUser();
  const { get } = useApi();
  const filterQuery = useFilterQuery(
    ['websites', { includeTeams, onlyTeams }],
    params => {
      return get(`/users/${user?.id}/websites`, {
        includeTeams,
        onlyTeams,
        ...params,
      });
    },
    { enabled: !!user },
  );
  const { refetch } = filterQuery;
  const { showToast } = useToasts();

  const handleSave = async () => {
    await refetch();
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
  };

  const addButton = (
    <ModalTrigger>
      <Button variant="primary">
        <Icon>
          <Icons.Plus />
        </Icon>
        <Text>{formatMessage(labels.addWebsite)}</Text>
      </Button>
      <Modal title={formatMessage(labels.addWebsite)}>
        {close => <WebsiteAddForm onSave={handleSave} onClose={close} />}
      </Modal>
    </ModalTrigger>
  );

  return (
    <>
      {showHeader && (
        <PageHeader title={formatMessage(labels.websites)}>
          {user.role !== ROLES.viewOnly && addButton}
        </PageHeader>
      )}
      <DataTable {...filterQuery}>
        {({ data }) => (
          <WebsitesTable data={data} showTeam={showTeam} showEditButton={showEditButton} />
        )}
      </DataTable>
    </>
  );
}

export default WebsitesList;
