import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import PageHeader from 'components/layout/PageHeader';
import Button from 'components/common/Button';
import Icon from 'components/common/Icon';
import Table from 'components/common/Table';
import Modal from 'components/common/Modal';
import AccountEditForm from 'components/forms/AccountEditForm';
import ButtonLayout from 'components/layout/ButtonLayout';
import Pen from 'assets/pen.svg';
import Plus from 'assets/plus.svg';
import Trash from 'assets/trash.svg';
import Check from 'assets/check.svg';
import { get } from 'lib/web';
import styles from './AccountSettings.module.css';
import DeleteForm from '../forms/DeleteForm';

export default function AccountSettings() {
  const [data, setData] = useState();
  const [addAccount, setAddAccount] = useState();
  const [editAccount, setEditAccount] = useState();
  const [deleteAccount, setDeleteAccount] = useState();
  const [saved, setSaved] = useState(0);

  const Checkmark = ({ is_admin }) => (is_admin ? <Icon icon={<Check />} size="medium" /> : null);

  const Buttons = row =>
    row.username !== 'admin' ? (
      <ButtonLayout>
        <Button icon={<Pen />} size="small" onClick={() => setEditAccount(row)}>
          <div>Edit</div>
        </Button>
        <Button icon={<Trash />} size="small" onClick={() => setDeleteAccount(row)}>
          <div>Delete</div>
        </Button>
      </ButtonLayout>
    ) : null;

  const columns = [
    { key: 'username', label: 'Username', className: 'col-6 col-md-4' },
    {
      key: 'is_admin',
      label: 'Administrator',
      className: 'col-6 col-md-4',
      render: Checkmark,
    },
    {
      className: classNames(styles.buttons, 'col-12 col-md-4 pt-2 pt-md-0'),
      render: Buttons,
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
    setData(await get(`/api/accounts`));
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
          <AccountEditForm
            values={{ ...editAccount, password: '' }}
            onSave={handleSave}
            onClose={handleClose}
          />
        </Modal>
      )}
      {addAccount && (
        <Modal title="Add account">
          <AccountEditForm onSave={handleSave} onClose={handleClose} />
        </Modal>
      )}
      {deleteAccount && (
        <Modal title="Delete account">
          <DeleteForm
            values={{ type: 'account', id: deleteAccount.user_id, name: deleteAccount.username }}
            onSave={handleSave}
            onClose={handleClose}
          />
        </Modal>
      )}
    </>
  );
}
