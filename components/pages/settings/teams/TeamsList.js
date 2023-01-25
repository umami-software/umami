import { useState } from 'react';
import { Button, Icon, Modal, useToast, Icons, Text } from 'react-basics';
import { useIntl } from 'react-intl';
import useApi from 'hooks/useApi';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import TeamAddForm from 'components/pages/settings/teams/TeamAddForm';
import PageHeader from 'components/layout/PageHeader';
import TeamsTable from 'components/pages/settings/teams/TeamsTable';
import Page from 'components/layout/Page';
import { labels, messages } from 'components/messages';

const { Plus } = Icons;

export default function TeamsList() {
  const { formatMessage } = useIntl();
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
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
  };

  const handleClose = () => {
    setEdit(false);
  };

  return (
    <Page loading={isLoading} error={error}>
      {toast}
      <PageHeader title={formatMessage(labels.team)}>
        <Button variant="primary" onClick={handleAdd}>
          <Icon>
            <Plus />
          </Icon>
          <Text>{formatMessage(labels.createTeam)}</Text>
        </Button>
      </PageHeader>
      {hasData && <TeamsTable data={data} />}
      {!hasData && (
        <EmptyPlaceholder message={formatMessage(messages.noTeams)}>
          <Button variant="primary" onClick={handleAdd}>
            <Icon>
              <Plus />
            </Icon>
            <Text>{formatMessage(labels.createTeam)}</Text>
          </Button>
        </EmptyPlaceholder>
      )}
      {edit && (
        <Modal title={formatMessage(labels.createTeam)} onClose={handleClose}>
          {close => <TeamAddForm onSave={handleSave} onClose={close} />}
        </Modal>
      )}
    </Page>
  );
}
