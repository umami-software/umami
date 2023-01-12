import { useState } from 'react';
import { Button, Icon, Modal, useToast } from 'react-basics';
import useApi from 'hooks/useApi';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import WebsiteAddForm from 'components/pages/settings/websites/WebsiteAddForm';
import PageHeader from 'components/layout/PageHeader';
import WebsitesTable from 'components/pages/settings/websites/WebsitesTable';
import Page from 'components/layout/Page';
import useUser from 'hooks/useUser';

export default function WebsitesList() {
  const [edit, setEdit] = useState(false);
  const { get, useQuery } = useApi();
  const { user } = useUser();
  const { data, isLoading, error, refetch } = useQuery(
    ['websites', user?.id],
    () => get(`/users/${user?.id}/websites`),
    { enabled: !!user },
  );
  const hasData = data && data.length !== 0;
  const { toast, showToast } = useToast();

  const columns = [
    { name: 'name', label: 'Name', style: { flex: 2 } },
    { name: 'domain', label: 'Domain' },
    { name: 'action', label: ' ' },
  ];

  const handleAdd = () => {
    setEdit(true);
  };

  const handleSave = async () => {
    await refetch();
    setEdit(false);
    showToast({ message: 'Website saved.', variant: 'success' });
  };

  const handleClose = () => {
    setEdit(false);
  };

  return (
    <Page loading={isLoading} error={error}>
      {toast}
      <PageHeader title="Websites">
        <Button onClick={handleAdd}>
          <Icon icon="plus" /> Add website
        </Button>
      </PageHeader>

      {hasData && <WebsitesTable columns={columns} rows={data} />}
      {!hasData && (
        <EmptyPlaceholder message="You don't have any websites configured.">
          <Button variant="primary" onClick={handleAdd}>
            <Icon icon="plus" /> Add website
          </Button>
        </EmptyPlaceholder>
      )}
      {edit && (
        <Modal title="Add website" onClose={handleClose}>
          {close => <WebsiteAddForm onSave={handleSave} onClose={close} />}
        </Modal>
      )}
    </Page>
  );
}
