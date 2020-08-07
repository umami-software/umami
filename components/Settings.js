import React, { useState, useEffect } from 'react';
import Page from './Page';
import Table from './Table';
import { get } from 'lib/web';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'domain', label: 'Domain' },
];

export default function Settings() {
  const [data, setData] = useState();

  async function loadData() {
    setData(await get(`/api/website`));
  }

  useEffect(() => {
    loadData();
  }, []);

  if (!data) {
    return null;
  }

  return (
    <Page>
      <h2>Settings</h2>
      <Table columns={columns} rows={data.websites} />
    </Page>
  );
}
