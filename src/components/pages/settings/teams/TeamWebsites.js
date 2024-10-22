import {
  ActionForm,
  Button,
  Icon,
  Icons,
  Loading,
  Modal,
  ModalTrigger,
  Text,
  useToasts,
} from 'react-basics';
import TeamWebsitesTable from 'components/pages/settings/teams/TeamWebsitesTable';
import TeamAddWebsiteForm from 'components/pages/settings/teams/TeamAddWebsiteForm';
import useApi from 'components/hooks/useApi';
import useMessages from 'components/hooks/useMessages';
import useApiFilter from 'components/hooks/useApiFilter';

export function TeamWebsites({ teamId }) {
  const { showToast } = useToasts();
  const { formatMessage, labels, messages } = useMessages();
  const { filter, page, pageSize, handleFilterChange, handlePageChange, handlePageSizeChange } =
    useApiFilter();
  const { get, useQuery } = useApi();
  const { data, isLoading, refetch } = useQuery(
    ['teams:websites', teamId, filter, page, pageSize],
    () =>
      get(`/teams/${teamId}/websites`, {
        filter,
        page,
        pageSize,
      }),
  );
  const hasData = data && data.length !== 0;

  if (isLoading) {
    return <Loading icon="dots" style={{ minHeight: 300 }} />;
  }

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
        {close => <TeamAddWebsiteForm teamId={teamId} onSave={handleSave} onClose={close} />}
      </Modal>
    </ModalTrigger>
  );

  return (
    <div>
      <ActionForm description={formatMessage(messages.teamWebsitesInfo)}>{addButton}</ActionForm>
      {hasData && (
        <TeamWebsitesTable
          teamId={teamId}
          data={data}
          onSave={handleSave}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          filterValue={filter}
        />
      )}
    </div>
  );
}

export default TeamWebsites;
