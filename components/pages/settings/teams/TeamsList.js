import { useState } from 'react';
import { Button, Icon, Modal, ModalTrigger, useToast, Icons, Text } from 'react-basics';
import { useIntl } from 'react-intl';
import useApi from 'hooks/useApi';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import TeamAddForm from 'components/pages/settings/teams/TeamAddForm';
import PageHeader from 'components/layout/PageHeader';
import TeamsTable from 'components/pages/settings/teams/TeamsTable';
import Page from 'components/layout/Page';
import { labels, messages } from 'components/messages';

export default function TeamsList() {
  const { formatMessage } = useIntl();
  const [update, setUpdate] = useState(0);
  const { get, useQuery } = useApi();
  const { data, isLoading, error } = useQuery(['teams', update], () => get(`/teams`));
  const hasData = data && data.length !== 0;
  const { toast, showToast } = useToast();

  const handleSave = () => {
    setUpdate(state => state + 1);
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
  };

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
      <PageHeader title={formatMessage(labels.team)}>{createButton}</PageHeader>
      {hasData && <TeamsTable data={data} />}
      {!hasData && (
        <EmptyPlaceholder message={formatMessage(messages.noTeams)}>
          {createButton}
        </EmptyPlaceholder>
      )}
    </Page>
  );
}
