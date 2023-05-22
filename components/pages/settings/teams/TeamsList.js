import { useState } from 'react';
import { Button, Icon, Modal, ModalTrigger, useToast, Text, Flexbox } from 'react-basics';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import TeamAddForm from 'components/pages/settings/teams/TeamAddForm';
import PageHeader from 'components/layout/PageHeader';
import TeamsTable from 'components/pages/settings/teams/TeamsTable';
import Page from 'components/layout/Page';
import Icons from 'components/icons';
import TeamJoinForm from './TeamJoinForm';
import useApi from 'hooks/useApi';
import useMessages from 'hooks/useMessages';

export default function TeamsList() {
  const { formatMessage, labels, messages } = useMessages();
  const [update, setUpdate] = useState(0);
  const { get, useQuery } = useApi();
  const { data, isLoading, error } = useQuery(['teams', update], () => get(`/teams`));
  const hasData = data && data.length !== 0;
  const { toast, showToast } = useToast();

  const handleSave = () => {
    setUpdate(state => state + 1);
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
  };

  const handleJoin = () => {
    setUpdate(state => state + 1);
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
  };

  const handleDelete = () => {
    setUpdate(state => state + 1);
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
  };

  const joinButton = (
    <ModalTrigger>
      <Button variant="secondary">
        <Icon>
          <Icons.AddUser />
        </Icon>
        <Text>{formatMessage(labels.joinTeam)}</Text>
      </Button>
      <Modal title={formatMessage(labels.joinTeam)}>
        {close => <TeamJoinForm onSave={handleJoin} onClose={close} />}
      </Modal>
    </ModalTrigger>
  );

  const createButton = (
    <ModalTrigger>
      <Button variant="primary">
        <Icon>
          <Icons.Plus />
        </Icon>
        <Text>{formatMessage(labels.createTeam)}</Text>
      </Button>
      <Modal title={formatMessage(labels.createTeam)}>
        {close => <TeamAddForm onSave={handleSave} onClose={close} />}
      </Modal>
    </ModalTrigger>
  );

  return (
    <Page loading={isLoading} error={error}>
      {toast}
      <PageHeader title={formatMessage(labels.teams)}>
        {hasData && (
          <Flexbox gap={10}>
            {joinButton}
            {createButton}
          </Flexbox>
        )}
      </PageHeader>
      {hasData && <TeamsTable data={data} onDelete={handleDelete} />}
      {!hasData && (
        <EmptyPlaceholder message={formatMessage(messages.noTeams)}>
          <Flexbox gap={10}>
            {joinButton}
            {createButton}
          </Flexbox>
        </EmptyPlaceholder>
      )}
    </Page>
  );
}
