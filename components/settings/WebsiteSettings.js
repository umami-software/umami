import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import Table from 'components/common/Table';
import Button from 'components/common/Button';
import PageHeader from 'components/layout/PageHeader';
import Modal from 'components/common/Modal';
import WebsiteEditForm from '../forms/WebsiteEditForm';
import DeleteForm from '../forms/DeleteForm';
import TrackingCodeForm from '../forms/TrackingCodeForm';
import ShareUrlForm from '../forms/ShareUrlForm';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import ButtonLayout from 'components/layout/ButtonLayout';
import Pen from 'assets/pen.svg';
import Trash from 'assets/trash.svg';
import Plus from 'assets/plus.svg';
import Code from 'assets/code.svg';
import Link from 'assets/link.svg';
import { get } from 'lib/web';
import styles from './WebsiteSettings.module.css';

export default function WebsiteSettings() {
  const [data, setData] = useState();
  const [editWebsite, setEditWebsite] = useState();
  const [deleteWebsite, setDeleteWebsite] = useState();
  const [addWebsite, setAddWebsite] = useState();
  const [showCode, setShowCode] = useState();
  const [showUrl, setShowUrl] = useState();
  const [saved, setSaved] = useState(0);

  const Buttons = row => (
    <ButtonLayout>
      {row.share_id && (
        <Button
          icon={<Link />}
          size="small"
          tooltip="Share URL"
          tooltipId={`button-share-${row.website_id}`}
          onClick={() => setShowUrl(row)}
        />
      )}
      <Button
        icon={<Code />}
        size="small"
        tooltip="Get tracking code"
        tooltipId={`button-code-${row.website_id}`}
        onClick={() => setShowCode(row)}
      />
      <Button icon={<Pen />} size="small" onClick={() => setEditWebsite(row)}>
        <div>Edit</div>
      </Button>
      <Button icon={<Trash />} size="small" onClick={() => setDeleteWebsite(row)}>
        <div>Delete</div>
      </Button>
    </ButtonLayout>
  );

  const columns = [
    { key: 'name', label: 'Name', className: 'col-6 col-md-4' },
    { key: 'domain', label: 'Domain', className: 'col-6 col-md-4' },
    {
      key: 'action',
      className: classNames(styles.buttons, 'col-12 col-md-4 pt-2 pt-md-0'),
      render: Buttons,
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
    setShowUrl(null);
  }

  async function loadData() {
    setData(await get(`/api/websites`));
  }

  useEffect(() => {
    loadData();
  }, [saved]);

  if (!data) {
    return null;
  }

  const empty = (
    <EmptyPlaceholder msg={"You don't have any websites configured."}>
      <Button icon={<Plus />} size="medium" onClick={() => setAddWebsite(true)}>
        <div>Add website</div>
      </Button>
    </EmptyPlaceholder>
  );

  return (
    <>
      <PageHeader>
        <div>Websites</div>
        <Button icon={<Plus />} size="small" onClick={() => setAddWebsite(true)}>
          <div>Add website</div>
        </Button>
      </PageHeader>
      <Table columns={columns} rows={data} empty={empty} />
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
          <DeleteForm
            values={{ type: 'website', id: deleteWebsite.website_id, name: deleteWebsite.name }}
            onSave={handleSave}
            onClose={handleClose}
          />
        </Modal>
      )}
      {showCode && (
        <Modal title="Tracking code">
          <TrackingCodeForm values={showCode} onClose={handleClose} />
        </Modal>
      )}
      {showUrl && (
        <Modal title="Share URL">
          <ShareUrlForm values={showUrl} onClose={handleClose} />
        </Modal>
      )}
    </>
  );
}
