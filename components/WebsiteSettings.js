import React, { useState, useEffect } from 'react';
import Table from './common/Table';
import Button from './common/Button';
import PageHeader from './layout/PageHeader';
import Pen from 'assets/pen.svg';
import Trash from 'assets/trash.svg';
import Plus from 'assets/plus.svg';
import Code from 'assets/code.svg';
import { get } from 'lib/web';
import Modal from './common/Modal';
import WebsiteEditForm from './forms/WebsiteEditForm';
import WebsiteDeleteForm from './forms/WebsiteDeleteForm';
import WebsiteCodeForm from './forms/WebsiteCodeForm';
import styles from './WebsiteSettings.module.css';

export default function WebsiteSettings() {
  const [data, setData] = useState();
  const [editWebsite, setEditWebsite] = useState();
  const [deleteWebsite, setDeleteWebsite] = useState();
  const [addWebsite, setAddWebsite] = useState();
  const [showCode, setShowCode] = useState();
  const [saved, setSaved] = useState(0);

  const columns = [
    { key: 'name', label: 'Name', className: styles.col },
    { key: 'domain', label: 'Domain', className: styles.col },
    {
      key: 'action',
      className: styles.buttons,
      render: row => (
        <>
          <Button icon={<Code />} size="small" onClick={() => setShowCode(row)}>
            <div>Get Code</div>
          </Button>
          <Button icon={<Pen />} size="small" onClick={() => setEditWebsite(row)}>
            <div>Edit</div>
          </Button>
          <Button icon={<Trash />} size="small" onClick={() => setDeleteWebsite(row)}>
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
    setAddWebsite(null);
    setEditWebsite(null);
    setDeleteWebsite(null);
    setShowCode(null);
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
    <>
      <PageHeader>
        <div>Websites</div>
        <Button icon={<Plus />} size="small" onClick={() => setAddWebsite(true)}>
          <div>Add website</div>
        </Button>
      </PageHeader>
      <Table columns={columns} rows={data} />
      {editWebsite && (
        <Modal title="Edit website">
          <WebsiteEditForm values={editWebsite} onSave={handleSave} onClose={handleClose} />
        </Modal>
      )}
      {addWebsite && (
        <Modal title="Add website">
          <WebsiteEditForm onSave={handleSave} onClose={handleClose} />
        </Modal>
      )}
      {deleteWebsite && (
        <Modal title="Delete website">
          <WebsiteDeleteForm values={deleteWebsite} onSave={handleSave} onClose={handleClose} />
        </Modal>
      )}
      {showCode && (
        <Modal title="Tracking code">
          <WebsiteCodeForm values={showCode} onClose={handleClose} />
        </Modal>
      )}
    </>
  );
}
