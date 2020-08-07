import React, { useState, useEffect } from 'react';
import Page from './Page';
import Table from './Table';
import Button from './Button';
import Icon from './Icon';
import PageHeader from './PageHeader';
import Pen from 'assets/pen.svg';
import Trash from 'assets/trash.svg';
import Plus from 'assets/plus.svg';
import { get } from 'lib/web';

export default function Settings() {
  const [data, setData] = useState();

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'domain', label: 'Domain' },
    {
      key: 'action',
      label: '',
      style: { flex: 0 },
      render: ({ website_id }) => (
        <>
          <Button icon={<Pen />} size="S">
            <div>Edit</div>
          </Button>
          <Button icon={<Trash />} size="S">
            <div>Delete</div>
          </Button>
        </>
      ),
    },
  ];

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
      <PageHeader>
        <div>Settings</div>
        <Button size="S">
          <Icon icon={<Plus />} size="S" />
          <div>Add website</div>
        </Button>
      </PageHeader>
      <Table columns={columns} rows={data.websites} />
    </Page>
  );
}
