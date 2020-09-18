import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import PageHeader from 'components/layout/PageHeader';
import Button from 'components/common/Button';
import Icon from 'components/common/Icon';
import Table from 'components/common/Table';
import Modal from 'components/common/Modal';
import Toast from 'components/common/Toast';
import AccountEditForm from 'components/forms/AccountEditForm';
import ButtonLayout from 'components/layout/ButtonLayout';
import DeleteForm from 'components/forms/DeleteForm';
import useFetch from 'hooks/useFetch';
import Pen from 'assets/pen.svg';
import Plus from 'assets/plus.svg';
import Trash from 'assets/trash.svg';
import Check from 'assets/check.svg';
import List from 'assets/list-ul.svg';
import styles from './AccountSettings.module.css';

export default function AccountSettings() {
  const router = useRouter();
  const [addAccount, setAddAccount] = useState();
  const [editAccount, setEditAccount] = useState();
  const [deleteAccount, setDeleteAccount] = useState();
  const [saved, setSaved] = useState(0);
  const [message, setMessage] = useState();
  const { data } = useFetch(`/api/accounts`, {}, { update: [saved] });

  const Checkmark = ({ is_admin }) => (is_admin ? <Icon icon={<Check />} size="medium" /> : null);

  const Buttons = row =>
    row.username !== 'admin' ? (
      <ButtonLayout>
        <Button
          icon={<List />}
          size="small"
          tooltip={<FormattedMessage id="button.websites" defaultMessage="Websites" />}
          tooltipId={`button-websites-${row.username}`}
          onClick={() => router.push(`/dashboard/${row.user_id}/${row.username}`)}
        />
        <Button icon={<Pen />} size="small" onClick={() => setEditAccount(row)}>
          <div>
            <FormattedMessage id="button.edit" defaultMessage="Edit" />
          </div>
        </Button>
        <Button icon={<Trash />} size="small" onClick={() => setDeleteAccount(row)}>
          <div>
            <FormattedMessage id="button.delete" defaultMessage="Delete" />
          </div>
        </Button>
      </ButtonLayout>
    ) : null;

  const columns = [
    {
      key: 'username',
      label: <FormattedMessage id="label.username" defaultMessage="Username" />,
      className: 'col-6 col-md-4',
    },
    {
      key: 'is_admin',
      label: <FormattedMessage id="label.administrator" defaultMessage="Administrator" />,
      className: 'col-6 col-md-4',
      render: Checkmark,
    },
    {
      key: 'actions',
      className: classNames(styles.buttons, 'col-12 col-md-4 pt-2 pt-md-0'),
      render: Buttons,
    },
  ];

  function handleSave() {
    setSaved(state => state + 1);
    setMessage(<FormattedMessage id="message.save-success" defaultMessage="Saved successfully." />);
    handleClose();
  }

  function handleClose() {
    setEditAccount(null);
    setAddAccount(null);
    setDeleteAccount(null);
  }

  if (!data) {
    return null;
  }

  return (
    <>
      <PageHeader>
        <div>
          <FormattedMessage id="label.accounts" defaultMessage="Accounts" />
        </div>
        <Button icon={<Plus />} size="small" onClick={() => setAddAccount(true)}>
          <div>
            <FormattedMessage id="button.add-account" defaultMessage="Add account" />
          </div>
        </Button>
      </PageHeader>
      <Table columns={columns} rows={data} />
      {editAccount && (
        <Modal title={<FormattedMessage id="title.edit-account" defaultMessage="Edit account" />}>
          <AccountEditForm
            values={{ ...editAccount, password: '' }}
            onSave={handleSave}
            onClose={handleClose}
          />
        </Modal>
      )}
      {addAccount && (
        <Modal title={<FormattedMessage id="title.add-account" defaultMessage="Add account" />}>
          <AccountEditForm onSave={handleSave} onClose={handleClose} />
        </Modal>
      )}
      {deleteAccount && (
        <Modal
          title={<FormattedMessage id="title.delete-account" defaultMessage="Delete account" />}
        >
          <DeleteForm
            values={{ type: 'account', id: deleteAccount.user_id, name: deleteAccount.username }}
            onSave={handleSave}
            onClose={handleClose}
          />
        </Modal>
      )}
      {message && <Toast message={message} onClose={() => setMessage(null)} />}
    </>
  );
}
