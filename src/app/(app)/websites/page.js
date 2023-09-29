'use client';
import WebsiteList from 'app/(app)/settings/websites/WebsitesList';
import { useMessages } from 'components/hooks';
import { useState } from 'react';
import { Item, Tabs } from 'react-basics';
import WebsitesHeader from '../settings/websites/WebsitesHeader';

const TABS = {
  myWebsites: 'my-websites',
  teamWebsites: 'team-websites',
};

export default function WebsitesPage() {
  const { formatMessage, labels } = useMessages();
  const [tab, setTab] = useState(TABS.myWebsites);

  return (
    <>
      <WebsitesHeader />
      <Tabs selectedKey={tab} onSelect={setTab} style={{ marginBottom: 30 }}>
        <Item key={TABS.myWebsites}>{formatMessage(labels.myWebsites)}</Item>
        <Item key={TABS.teamWebsites}>{formatMessage(labels.teamWebsites)}</Item>
      </Tabs>
      {tab === TABS.myWebsites && <WebsiteList showHeader={false} />}
      {tab === TABS.teamWebsites && (
        <WebsiteList showHeader={false} showTeam={true} onlyTeams={true} />
      )}
    </>
  );
}
