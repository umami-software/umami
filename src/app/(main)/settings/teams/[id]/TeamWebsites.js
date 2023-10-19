import { ActionForm, Button, Icon, Icons, Modal, ModalTrigger, Text } from 'react-basics';
import TeamWebsitesTable from './TeamWebsitesTable';
import TeamWebsiteAddForm from './TeamWebsiteAddForm';
import useApi from 'components/hooks/useApi';
import useMessages from 'components/hooks/useMessages';
import useUser from 'components/hooks/useUser';
import useFilterQuery from 'components/hooks/useFilterQuery';
import DataTable from 'components/common/DataTable';
import useCache from 'store/cache';

export function TeamWebsites({ teamId }) {
  const { formatMessage, labels, messages } = useMessages();
  const { user } = useUser();
  const { get } = useApi();
  const modified = useCache(state => state?.['team:websites']);
  const queryResult = useFilterQuery(
    ['team:websites', { teamId, modified }],
    params => {
      return get(`/teams/${teamId}/websites`, {
        ...params,
      });
    },
    { enabled: !!user },
  );

  const handleChange = () => {
    queryResult.refetch();
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
            {close => <TeamWebsiteAddForm teamId={teamId} onSave={handleChange} onClose={close} />}
          </Modal>
        </ModalTrigger>
      </ActionForm>
      <DataTable queryResult={queryResult}>
        {({ data }) => <TeamWebsitesTable data={data} onRemove={handleChange} />}
      </DataTable>
    </>
  );
}

export default TeamWebsites;
