import { useState } from 'react';
import { Button, Icon, Modal, useToast } from 'react-basics';
import useApi from 'hooks/useApi';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import TeamAddForm from 'components/pages/settings/teams/TeamAddForm';
import PageHeader from 'components/layout/PageHeader';
import TeamsTable from 'components/pages/settings/teams/TeamsTable';
import Page from 'components/layout/Page';

export default function TeamsList() {
  const [edit, setEdit] = useState(false);
  const [update, setUpdate] = useState(0);
  const { get, useQuery } = useApi();
  const { data, isLoading, error } = useQuery(['teams', update], () => get(`/teams`));
  const hasData = data && data.length !== 0;
  const { toast, showToast } = useToast();

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
      {hasData && <TeamsTable data={data} />}
      {!hasData && (
        <EmptyPlaceholder message="You don't have any teams configured.">
          <Button variant="primary" onClick={handleAdd}>
            <Icon icon="plus" /> Create team
          </Button>
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
