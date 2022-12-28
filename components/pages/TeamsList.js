import { useState } from 'react';
import { Button, Icon, Modal, useToast, Flexbox } from 'react-basics';
import useApi from 'hooks/useApi';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import TeamAddForm from 'components/forms/TeamAddForm';
import PageHeader from 'components/layout/PageHeader';
import TeamsTable from 'components/tables/TeamsTable';
import Page from 'components/layout/Page';
import { getClientAuthToken } from 'lib/client';
import { useQuery } from '@tanstack/react-query';

export default function TeamsList() {
  const [edit, setEdit] = useState(false);
  const [update, setUpdate] = useState(0);
  const { get } = useApi(getClientAuthToken());
  const { data, isLoading, error } = useQuery(['teams', update], () => get(`/teams`));
  const hasData = data && data.length !== 0;
  const { toast, showToast } = useToast();

  const columns = [
    { name: 'name', label: 'Name', style: { flex: 2 } },
    { name: 'action', label: ' ' },
  ];

  const handleAdd = () => {
    setEdit(true);
  };

  const handleSave = () => {
    setEdit(false);
    setUpdate(state => state + 1);
    showToast({ message: 'Team saved.', variant: 'success' });
  };

  const handleClose = () => {
    setEdit(false);
  };

  return (
    <Page loading={isLoading} error={error}>
      {toast}
      <PageHeader title="Teams">
        <Button onClick={handleAdd}>
          <Icon icon="plus" /> Create team
        </Button>
      </PageHeader>

      {hasData && <TeamsTable columns={columns} rows={data} />}
      {!hasData && (
        <EmptyPlaceholder msg="You don't have any teams configured.">
          <Flexbox justifyContent="center" alignItems="center">
            <Button variant="primary" onClick={handleAdd}>
              <Icon icon="plus" /> Create team
            </Button>
          </Flexbox>
        </EmptyPlaceholder>
      )}
      {edit && (
        <Modal title="Create team" onClose={handleClose}>
          {close => <TeamAddForm onSave={handleSave} onClose={close} />}
        </Modal>
      )}
    </Page>
  );
}
