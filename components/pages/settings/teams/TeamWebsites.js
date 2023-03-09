import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import { labels, messages } from 'components/messages';
import TeamWebsitesTable from 'components/pages/settings/teams/TeamWebsitesTable';
import useApi from 'hooks/useApi';
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
import { useIntl } from 'react-intl';
import WebsiteAddTeamForm from 'components/pages/settings/teams/WebsiteAddTeamForm';

export default function TeamWebsites({ teamId }) {
  const { toast, showToast } = useToast();
  const { formatMessage } = useIntl();
  const { get, useQuery } = useApi();
  const { data, isLoading, refetch } = useQuery(['teams:websites', teamId], () =>
    get(`/teams/${teamId}/websites`),
  );
  const hasData = data && data.length !== 0;

  if (isLoading) {
    return <Loading icon="dots" position="block" />;
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
        {close => <WebsiteAddTeamForm teamId={teamId} onSave={handleSave} onClose={close} />}
      </Modal>
    </ModalTrigger>
  );

  return (
    <div>
      {toast}
      {hasData && (
        <ActionForm description={formatMessage(messages.websitesAreShared)}>{addButton}</ActionForm>
      )}
      {hasData && <TeamWebsitesTable teamId={teamId} data={data} onSave={handleSave} />}
      {!hasData && (
        <EmptyPlaceholder message={formatMessage(messages.noTeamWebsites)}>
          {addButton}
        </EmptyPlaceholder>
      )}
    </div>
  );
}
