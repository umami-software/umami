import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PageHeader from './layout/PageHeader';
import Button from './common/Button';
import Table from './common/Table';
import Pen from 'assets/pen.svg';
import Plus from 'assets/plus.svg';
import Trash from 'assets/trash.svg';
import { get } from 'lib/web';
import styles from './AccountSettings.module.css';
import Modal from './common/Modal';
import WebsiteEditForm from './forms/WebsiteEditForm';
import AccountEditForm from './forms/AccountEditForm';

export default function AccountSettings() {
  const user = useSelector(state => state.user);
  const [data, setData] = useState();
  const [addAccount, setAddAccount] = useState();
  const [editAccount, setEditAccount] = useState();
  const [deleteAccount, setDeleteAccount] = useState();
  const [saved, setSaved] = useState(0);

  const columns = [
    { key: 'username', label: 'Username' },
    {
      render: row => (
        <>
          <Button icon={<Pen />} size="small" onClick={() => setEditAccount(row)}>
            <div>Edit</div>
          </Button>
          <Button icon={<Trash />} size="small" onClick={() => setDeleteAccount(row)}>
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
    setEditAccount(null);
    setAddAccount(null);
    setDeleteAccount(null);
  }

  async function loadData() {
    setData(await get(`/api/account`));
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
        <div>Accounts</div>
        <Button icon={<Plus />} size="small" onClick={() => setAddAccount(true)}>
          <div>Add account</div>
        </Button>
      </PageHeader>
      <Table columns={columns} rows={data} />
      {editAccount && (
        <Modal title="Edit account">
          <AccountEditForm values={editAccount} onSave={handleSave} onClose={handleClose} />
        </Modal>
      )}
      {addAccount && (
        <Modal title="Add account">
          <AccountEditForm onSave={handleSave} onClose={handleClose} />
        </Modal>
      )}
    </>
  );
}
