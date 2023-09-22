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

const TABS = {
  myWebsites: 'my-websites',
  teamWebsites: 'team-websites',
};

export function WebsitesPage() {
  const { formatMessage, labels, messages } = useMessages();
  const [tab, setTab] = useState(TABS.myWebsites);
  const { user } = useUser();
  const { showToast } = useToasts();
  const cloudMode = Boolean(process.env.cloudMode);

  const handleSave = () => {
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
        <Item key={TABS.myWebsites}>{formatMessage(labels.myWebsites)}</Item>
        <Item key={TABS.teamWebsites}>{formatMessage(labels.teamWebsites)}</Item>
      </Tabs>
      {tab === TABS.myWebsites && (
        <WebsiteList showEditButton={!cloudMode} showHeader={false} fetch={fetch} />
      )}
      {tab === TABS.teamWebsites && (
        <WebsiteList
          showEditButton={!cloudMode}
          showHeader={false}
          showTeam={true}
          onlyTeams={true}
        />
      )}
    </Page>
  );
}

export default WebsitesPage;
