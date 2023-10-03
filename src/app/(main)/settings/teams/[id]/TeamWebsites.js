import { ActionForm, Button, Icon, Icons, Modal, ModalTrigger, Text } from 'react-basics';
import TeamWebsitesTable from './TeamWebsitesTable';
import TeamAddWebsiteForm from './TeamAddWebsiteForm';
import useApi from 'components/hooks/useApi';
import useMessages from 'components/hooks/useMessages';
import useUser from 'components/hooks/useUser';
import useFilterQuery from 'components/hooks/useFilterQuery';
import DataTable from 'components/common/DataTable';

export function TeamWebsites({ teamId }) {
  const { formatMessage, labels, messages } = useMessages();
  const { user } = useUser();
  const { get } = useApi();
  const { getProps, refetch } = useFilterQuery(
    ['team:websites', teamId],
    params => {
      return get(`/teams/${teamId}/websites`, {
        ...params,
      });
    },
    { enabled: !!user },
  );

  const handleWebsiteAdd = () => {
    refetch();
  };

  return (
    <>
      <ActionForm description={formatMessage(messages.teamWebsitesInfo)}>
        <ModalTrigger>
          <Button variant="primary">
            <Icon>
              <Icons.Plus />
            </Icon>
            <Text>{formatMessage(labels.addWebsite)}</Text>
          </Button>
          <Modal title={formatMessage(labels.addWebsite)}>
            {close => (
              <TeamAddWebsiteForm teamId={teamId} onSave={handleWebsiteAdd} onClose={close} />
            )}
          </Modal>
        </ModalTrigger>
      </ActionForm>
      <DataTable {...getProps()}>{({ data }) => <TeamWebsitesTable data={data} />}</DataTable>
    </>
  );
}

export default TeamWebsites;
