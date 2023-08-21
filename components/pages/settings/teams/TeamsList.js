import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import Icons from 'components/icons';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import TeamAddForm from 'components/pages/settings/teams/TeamAddForm';
import TeamsTable from 'components/pages/settings/teams/TeamsTable';
import useApi from 'hooks/useApi';
import useMessages from 'hooks/useMessages';
import useUser from 'hooks/useUser';
import { ROLES } from 'lib/constants';
import { useState } from 'react';
import { Button, Flexbox, Icon, Modal, ModalTrigger, Text, useToasts } from 'react-basics';
import TeamJoinForm from './TeamJoinForm';
import useApiFilter from 'hooks/useApiFilter';

export default function TeamsList() {
  const { user } = useUser();
  const { formatMessage, labels, messages } = useMessages();
  const { filter, page, pageSize, handleFilterChange, handlePageChange, handlePageSizeChange } =
    useApiFilter();
  const [update, setUpdate] = useState(0);

  const { get, useQuery } = useApi();
  const { data, isLoading, error } = useQuery(['teams', update, filter, page, pageSize], () => {
    return get(`/teams`, {
      filter,
      page,
      pageSize,
    });
  });

  const hasData = data && data?.data.length !== 0;
  const isFiltered = filter;

  const { showToast } = useToasts();

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
    <>
      {user.role !== ROLES.viewOnly && (
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
      )}
    </>
  );

  return (
    <Page loading={isLoading} error={error}>
      <PageHeader title={formatMessage(labels.teams)}>
        {(hasData || isFiltered) && (
          <Flexbox gap={10}>
            {joinButton}
            {createButton}
          </Flexbox>
        )}
      </PageHeader>

      {(hasData || isFiltered) && (
        <TeamsTable
          data={data}
          onDelete={handleDelete}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          filterValue={filter}
        />
      )}

      {!hasData && !isFiltered && (
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
