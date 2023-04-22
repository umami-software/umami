import { Button, Icon, Text, Modal, ModalTrigger, useToast, Icons } from 'react-basics';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import WebsiteAddForm from 'components/pages/settings/websites/WebsiteAddForm';
import WebsitesTable from 'components/pages/settings/websites/WebsitesTable';
import useApi from 'hooks/useApi';
import useUser from 'hooks/useUser';
import useMessages from 'hooks/useMessages';

export function WebsitesList() {
  const { formatMessage, labels, messages } = useMessages();
  const { user } = useUser();
  const { get, useQuery } = useApi();
  const { data, isLoading, error, refetch } = useQuery(
    ['websites', user?.id],
    () => get(`/users/${user?.id}/websites`),
    { enabled: !!user },
  );
  const { toast, showToast } = useToast();
  const hasData = data && data.length !== 0;

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
    <Page loading={isLoading} error={error}>
      {toast}
      <PageHeader title={formatMessage(labels.websites)}>{addButton}</PageHeader>
      {hasData && <WebsitesTable data={data} />}
      {!hasData && (
        <EmptyPlaceholder message={formatMessage(messages.noWebsitesConfigured)}>
          {addButton}
        </EmptyPlaceholder>
      )}
    </Page>
  );
}

export default WebsitesList;
