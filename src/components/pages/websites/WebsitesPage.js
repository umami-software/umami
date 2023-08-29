import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import WebsiteAddForm from 'components/pages/settings/websites/WebsiteAddForm';
import WebsiteList from 'components/pages/settings/websites/WebsitesList';
import { useMessages } from 'components/hooks';
import useUser from 'components/hooks/useUser';
import { ROLES } from 'lib/constants';
import { useState } from 'react';
import {
  Button,
  Icon,
  Icons,
  Item,
  Modal,
  ModalTrigger,
  Tabs,
  Text,
  useToasts,
} from 'react-basics';

export function WebsitesPage() {
  const { formatMessage, labels, messages } = useMessages();
  const [tab, setTab] = useState('my-websites');
  const [fetch, setFetch] = useState(1);
  const { user } = useUser();
  const { showToast } = useToasts();
  const cloudMode = Boolean(process.env.cloudMode);

  const handleSave = async () => {
    setFetch(fetch + 1);
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
  };

  const addButton = (
    <>
      {user.role !== ROLES.viewOnly && (
        <ModalTrigger>
          <Button variant="primary">
            <Icon>
              <Icons.Plus />
            </Icon>
            <Text>{formatMessage(labels.addWebsite)}</Text>
          </Button>
          <Modal title={formatMessage(labels.addWebsite)}>
            {close => <WebsiteAddForm onSave={handleSave} onClose={close} />}
          </Modal>
        </ModalTrigger>
      )}
    </>
  );

  return (
    <Page>
      <PageHeader title={formatMessage(labels.websites)}>{!cloudMode && addButton}</PageHeader>
      <Tabs selectedKey={tab} onSelect={setTab} style={{ marginBottom: 30 }}>
        <Item key="my-websites">{formatMessage(labels.myWebsites)}</Item>
        <Item key="team-webaites">{formatMessage(labels.teamWebsites)}</Item>
      </Tabs>

      {tab === 'my-websites' && (
        <WebsiteList showEditButton={!cloudMode} showHeader={false} fetch={fetch} />
      )}
      {tab === 'team-webaites' && (
        <WebsiteList
          showEditButton={!cloudMode}
          showHeader={false}
          fetch={fetch}
          showTeam={true}
          onlyTeams={true}
        />
      )}
    </Page>
  );
}

export default WebsitesPage;
