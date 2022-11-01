import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Link from 'next/link';
import classNames from 'classnames';
import PageHeader from 'components/layout/PageHeader';
import Button from 'components/common/Button';
import Icon from 'components/common/Icon';
import Table from 'components/common/Table';
import Modal from 'components/common/Modal';
import Toast from 'components/common/Toast';
import UserEditForm from 'components/forms/UserEditForm';
import ButtonLayout from 'components/layout/ButtonLayout';
import DeleteForm from 'components/forms/DeleteForm';
import useFetch from 'hooks/useFetch';
import Pen from 'assets/pen.svg';
import Plus from 'assets/plus.svg';
import Trash from 'assets/trash.svg';
import Check from 'assets/check.svg';
import LinkIcon from 'assets/external-link.svg';
import styles from './UserSettings.module.css';

export default function UserSettings() {
  const [addUser, setAddUser] = useState();
  const [editUser, setEditUser] = useState();
  const [deleteUser, setDeleteUser] = useState();
  const [saved, setSaved] = useState(0);
  const [message, setMessage] = useState();
  const { data } = useFetch(`/users`, {}, [saved]);

  const Checkmark = ({ isAdmin }) => (isAdmin ? <Icon icon={<Check />} size="medium" /> : null);

  const DashboardLink = row => {
    return (
      <Link href={`/dashboard/${row.id}/${row.username}`}>
        <a>
          <Icon icon={<LinkIcon />} />
        </a>
      </Link>
    );
  };

  const Buttons = row => (
    <ButtonLayout align="right">
      <Button icon={<Pen />} size="small" onClick={() => setEditUser(row)}>
        <FormattedMessage id="label.edit" defaultMessage="Edit" />
      </Button>
      {!row.isAdmin && (
        <Button icon={<Trash />} size="small" onClick={() => setDeleteUser(row)}>
          <FormattedMessage id="label.delete" defaultMessage="Delete" />
        </Button>
      )}
    </ButtonLayout>
  );

  const columns = [
    {
      key: 'username',
      label: <FormattedMessage id="label.username" defaultMessage="Username" />,
      className: 'col-12 col-lg-4',
    },
    {
      key: 'isAdmin',
      label: <FormattedMessage id="label.administrator" defaultMessage="Administrator" />,
      className: 'col-12 col-lg-3',
      render: Checkmark,
    },
    {
      key: 'dashboard',
      label: <FormattedMessage id="label.dashboard" defaultMessage="Dashboard" />,
      className: 'col-12 col-lg-3',
      render: DashboardLink,
    },
    {
      key: 'actions',
      className: classNames(styles.buttons, 'col-12 col-lg-2 pt-2 pt-md-0'),
      render: Buttons,
    },
  ];

  function handleSave() {
    setSaved(state => state + 1);
    setMessage(<FormattedMessage id="message.save-success" defaultMessage="Saved successfully." />);
    handleClose();
  }

  function handleClose() {
    setEditUser(null);
    setAddUser(null);
    setDeleteUser(null);
  }

  if (!data) {
    return null;
  }

  return (
    <>
      <PageHeader>
        <div>
          <FormattedMessage id="label.users" defaultMessage="Users" />
        </div>
        <Button icon={<Plus />} size="small" onClick={() => setAddUser(true)}>
          <FormattedMessage id="label.add-user" defaultMessage="Add user" />
        </Button>
      </PageHeader>
      <Table columns={columns} rows={data} />
      {editUser && (
        <Modal title={<FormattedMessage id="label.edit-user" defaultMessage="Edit user" />}>
          <UserEditForm
            values={{ ...editUser, password: '' }}
            onSave={handleSave}
            onClose={handleClose}
          />
        </Modal>
      )}
      {addUser && (
        <Modal title={<FormattedMessage id="label.add-user" defaultMessage="Add user" />}>
          <UserEditForm onSave={handleSave} onClose={handleClose} />
        </Modal>
      )}
      {deleteUser && (
        <Modal title={<FormattedMessage id="label.delete-user" defaultMessage="Delete user" />}>
          <DeleteForm
            values={{ type: 'users', id: deleteUser.id, name: deleteUser.username }}
            onSave={handleSave}
            onClose={handleClose}
          />
        </Modal>
      )}
      {message && <Toast message={message} onClose={() => setMessage(null)} />}
    </>
  );
}
