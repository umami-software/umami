import { useState } from 'react';
import { Button, Icon, Modal, useToast, Flexbox } from 'react-basics';
import useApi from 'hooks/useApi';
import { useQuery } from '@tanstack/react-query';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import WebsiteAddForm from 'components/forms/WebsiteAddForm';
import PageHeader from 'components/layout/PageHeader';
import WebsitesTable from 'components/tables/WebsitesTable';
import Page from 'components/layout/Page';
import useUser from 'hooks/useUser';

export default function WebsitesList() {
  const [edit, setEdit] = useState(false);
  const [update, setUpdate] = useState(0);
  const { get } = useApi();
  const user = useUser();
  const { data, isLoading, error } = useQuery(['websites', update], () =>
    get(`/users/${user.id}/websites`),
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

  const handleSave = () => {
    setEdit(false);
    setUpdate(state => state + 1);
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
        <EmptyPlaceholder msg="You don't have any websites configured.">
          <Flexbox justifyContent="center" alignItems="center">
            <Button variant="primary" onClick={handleAdd}>
              <Icon icon="plus" /> Add website
            </Button>
          </Flexbox>
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
