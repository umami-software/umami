'use client';
import WebsitesDataTable from '../settings/websites/WebsitesDataTable';
import { useMessages, useUser } from 'components/hooks';
import { useState } from 'react';
import { Item, Tabs } from 'react-basics';

const TABS = {
  myWebsites: 'my-websites',
  teamWebsites: 'team-websites',
};

export function WebsitesBrowse() {
  const { user } = useUser();
  const { formatMessage, labels } = useMessages();
  const [tab, setTab] = useState(TABS.myWebsites);
  const allowEdit = !process.env.cloudMode;

  return (
    <>
      <Tabs selectedKey={tab} onSelect={(tab: any) => setTab(tab)} style={{ marginBottom: 30 }}>
        <Item key={TABS.myWebsites}>{formatMessage(labels.myWebsites)}</Item>
        <Item key={TABS.teamWebsites}>{formatMessage(labels.teamWebsites)}</Item>
      </Tabs>
      {tab === TABS.myWebsites && <WebsitesDataTable userId={user.id} allowEdit={allowEdit} />}
      {tab === TABS.teamWebsites && (
        <WebsitesDataTable
          userId={user.id}
          showTeam={true}
          onlyTeams={true}
          allowEdit={allowEdit}
        />
      )}
    </>
  );
}

export default WebsitesBrowse;
