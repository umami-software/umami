import React, { useState, useEffect } from 'react';
import Page from './layout/Page';
import Table from './common/Table';
import Button from './interface/Button';
import PageHeader from './layout/PageHeader';
import Pen from 'assets/pen.svg';
import Trash from 'assets/trash.svg';
import Plus from 'assets/plus.svg';
import { get } from 'lib/web';
import Modal from './common/Modal';
import WebsiteEditForm from './forms/WebsiteEditForm';
import styles from './Settings.module.css';
import WebsiteDeleteForm from './forms/WebsiteDeleteForm';

export default function Settings() {
  const [data, setData] = useState();
  const [edit, setEdit] = useState();
  const [del, setDelete] = useState();
  const [add, setAdd] = useState();
  const [saved, setSaved] = useState(0);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'domain', label: 'Domain' },
    {
      key: 'action',
      cell: {
        className: styles.buttons,
      },
      render: row => (
        <>
          <Button icon={<Pen />} size="S" onClick={() => setEdit(row)}>
            <div>Edit</div>
          </Button>
          <Button icon={<Trash />} size="S" onClick={() => setDelete(row)}>
            <div>Delete</div>
          </Button>
        </>
      ),
    },
  ];

  function handleSave() {
    setSaved(state => state + 1);
    handleClose();
  }

  function handleClose() {
    setAdd(null);
    setEdit(null);
    setDelete(null);
  }

  async function loadData() {
    setData(await get(`/api/website`));
  }

  useEffect(() => {
    loadData();
  }, [saved]);

  if (!data) {
    return null;
  }

  return (
    <Page>
      <PageHeader>
        <div>Websites</div>
        <Button icon={<Plus />} size="S" onClick={() => setAdd(true)}>
          <div>Add website</div>
        </Button>
      </PageHeader>
      <Table columns={columns} rows={data} />
      {edit && (
        <Modal title="Edit website">
          <WebsiteEditForm initialValues={edit} onSave={handleSave} onClose={handleClose} />
        </Modal>
      )}
      {add && (
        <Modal title="Add website">
          <WebsiteEditForm
            initialValues={{ name: '', domain: '' }}
            onSave={handleSave}
            onClose={handleClose}
          />
        </Modal>
      )}
      {del && (
        <Modal title="Delete website">
          <WebsiteDeleteForm initialValues={del} onSave={handleSave} onClose={handleClose} />
        </Modal>
      )}
    </Page>
  );
}
