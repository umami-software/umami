import {
  ActionForm,
  Button,
  Icon,
  Icons,
  Loading,
  Modal,
  ModalTrigger,
  Text,
  useToast,
} from 'react-basics';
import TeamWebsitesTable from 'components/pages/settings/teams/TeamWebsitesTable';
import TeamAddWebsiteForm from 'components/pages/settings/teams/TeamAddWebsiteForm';
import useApi from 'hooks/useApi';
import useMessages from 'hooks/useMessages';

export function TeamWebsites({ teamId }) {
  const { toast, showToast } = useToast();
  const { formatMessage, labels, messages } = useMessages();
  const { get, useQuery } = useApi();
  const { data, isLoading, refetch } = useQuery(['teams:websites', teamId], () =>
    get(`/teams/${teamId}/websites`),
  );
  const hasData = data && data.length !== 0;

  if (isLoading) {
    return <Loading icon="dots" style={{ minHeight: 300 }} />;
  }

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
        {close => <TeamAddWebsiteForm teamId={teamId} onSave={handleSave} onClose={close} />}
      </Modal>
    </ModalTrigger>
  );

  return (
    <div>
      {toast}
      <ActionForm description={formatMessage(messages.teamWebsitesInfo)}>{addButton}</ActionForm>
      {hasData && <TeamWebsitesTable teamId={teamId} data={data} onSave={handleSave} />}
    </div>
  );
}

export default TeamWebsites;
