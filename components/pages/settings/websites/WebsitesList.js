import { Button, Icon, Text, Modal, ModalTrigger, useToasts, Icons } from 'react-basics';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import WebsiteAddForm from 'components/pages/settings/websites/WebsiteAddForm';
import WebsitesTable from 'components/pages/settings/websites/WebsitesTable';
import useApi from 'hooks/useApi';
import useUser from 'hooks/useUser';
import useMessages from 'hooks/useMessages';
import { ROLES } from 'lib/constants';
import useApiFilter from 'hooks/useApiFilter';

export function WebsitesList({ showTeam, showHeader = true, includeTeams, onlyTeams, fetch }) {
  const { formatMessage, labels, messages } = useMessages();
  const { user } = useUser();
  const { filter, page, pageSize, handleFilterChange, handlePageChange, handlePageSizeChange } =
    useApiFilter();
  const { get, useQuery } = useApi();
  const { data, isLoading, error, refetch } = useQuery(
    ['websites', fetch, user?.id, filter, page, pageSize, includeTeams, onlyTeams],
    () =>
      get(`/users/${user?.id}/websites`, {
        filter,
        page,
        pageSize,
        includeTeams,
        onlyTeams,
      }),
    { enabled: !!user },
  );
  const { showToast } = useToasts();
  const hasData = data && data.length !== 0;

  const handleSave = async () => {
    await refetch();
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
  };

  const addButton = (
    <>
      {user.role !== ROLES.viewOnly && (
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
      )}
    </>
  );

  return (
    <Page loading={isLoading} error={error}>
      {showHeader && <PageHeader title={formatMessage(labels.websites)}>{addButton}</PageHeader>}
      {hasData && (
        <WebsitesTable
          data={data}
          showTeam={showTeam}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          filterValue={filter}
        />
      )}
      {!hasData && (
        <EmptyPlaceholder message={formatMessage(messages.noWebsitesConfigured)}>
          {addButton}
        </EmptyPlaceholder>
      )}
    </Page>
  );
}

export default WebsitesList;
