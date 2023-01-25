import { useState } from 'react';
import { Button, Icon, Text, Modal, useToast, Icons } from 'react-basics';
import { useIntl } from 'react-intl';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import WebsiteAddForm from 'components/pages/settings/websites/WebsiteAddForm';
import WebsitesTable from 'components/pages/settings/websites/WebsitesTable';
import useApi from 'hooks/useApi';
import useUser from 'hooks/useUser';
import { labels, messages } from 'components/messages';

const { Plus } = Icons;

export default function WebsitesList() {
  const [edit, setEdit] = useState(false);
  const { user } = useUser();
  const { get, useQuery } = useApi();
  const { data, isLoading, error, refetch } = useQuery(
    ['websites', user?.id],
    () => get(`/users/${user?.id}/websites`),
    { enabled: !!user },
  );
  const { toast, showToast } = useToast();
  const { formatMessage } = useIntl();
  const hasData = data && data.length !== 0;

  const handleSave = async () => {
    await refetch();
    setEdit(false);
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
  };

  const handleAdd = () => setEdit(true);

  const handleClose = () => setEdit(false);

  const addButton = (
    <Button variant="primary" onClick={handleAdd}>
      <Icon>
        <Plus />
      </Icon>
      <Text>{formatMessage(labels.addWebsite)}</Text>
    </Button>
  );

  return (
    <Page loading={isLoading} error={error}>
      {toast}
      <PageHeader title={formatMessage(labels.websites)}>{addButton}</PageHeader>
      {hasData && <WebsitesTable data={data} />}
      {!hasData && (
        <EmptyPlaceholder message={formatMessage(messages.noWebsites)}>
          {addButton}
        </EmptyPlaceholder>
      )}
      {edit && (
        <Modal title={formatMessage(labels.addWebsite)} onClose={handleClose}>
          {close => <WebsiteAddForm onSave={handleSave} onClose={close} />}
        </Modal>
      )}
    </Page>
  );
}
