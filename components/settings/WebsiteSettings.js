import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import Link from 'components/common/Link';
import Table from 'components/common/Table';
import Button from 'components/common/Button';
import PageHeader from 'components/layout/PageHeader';
import Modal from 'components/common/Modal';
import WebsiteEditForm from 'components/forms/WebsiteEditForm';
import DeleteForm from 'components/forms/DeleteForm';
import TrackingCodeForm from 'components/forms/TrackingCodeForm';
import ShareUrlForm from 'components/forms/ShareUrlForm';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import ButtonLayout from 'components/layout/ButtonLayout';
import Toast from 'components/common/Toast';
import Favicon from 'components/common/Favicon';
import Pen from 'assets/pen.svg';
import Trash from 'assets/trash.svg';
import Plus from 'assets/plus.svg';
import Code from 'assets/code.svg';
import LinkIcon from 'assets/link.svg';
import useFetch from 'hooks/useFetch';
import styles from './WebsiteSettings.module.css';

export default function WebsiteSettings() {
  const [editWebsite, setEditWebsite] = useState();
  const [deleteWebsite, setDeleteWebsite] = useState();
  const [addWebsite, setAddWebsite] = useState();
  const [showCode, setShowCode] = useState();
  const [showUrl, setShowUrl] = useState();
  const [saved, setSaved] = useState(0);
  const [message, setMessage] = useState();
  const { data } = useFetch(`/api/websites`, {}, [saved]);

  const Buttons = row => (
    <ButtonLayout align="right">
      {row.share_id && (
        <Button
          icon={<LinkIcon />}
          size="small"
          tooltip={<FormattedMessage id="message.get-share-url" defaultMessage="Get share URL" />}
          tooltipId={`button-share-${row.website_id}`}
          onClick={() => setShowUrl(row)}
        />
      )}
      <Button
        icon={<Code />}
        size="small"
        tooltip={
          <FormattedMessage id="message.get-tracking-code" defaultMessage="Get tracking code" />
        }
        tooltipId={`button-code-${row.website_id}`}
        onClick={() => setShowCode(row)}
      />
      <Button icon={<Pen />} size="small" onClick={() => setEditWebsite(row)}>
        <FormattedMessage id="label.edit" defaultMessage="Edit" />
      </Button>
      <Button icon={<Trash />} size="small" onClick={() => setDeleteWebsite(row)}>
        <FormattedMessage id="label.delete" defaultMessage="Delete" />
      </Button>
    </ButtonLayout>
  );

  const DetailsLink = ({ website_id, name, domain }) => (
    <Link href="/website/[...id]" as={`/website/${website_id}/${name}`}>
      <Favicon domain={domain} />
      {name}
    </Link>
  );

  const columns = [
    {
      key: 'name',
      label: <FormattedMessage id="label.name" defaultMessage="Name" />,
      className: 'col-6 col-xl-4',
      render: DetailsLink,
    },
    {
      key: 'domain',
      label: <FormattedMessage id="label.domain" defaultMessage="Domain" />,
      className: 'col-6 col-xl-4',
    },
    {
      key: 'action',
      className: classNames(styles.buttons, 'col-12 col-xl-4 pt-2 pt-xl-0'),
      render: Buttons,
    },
  ];

  function handleSave() {
    setSaved(state => state + 1);
    setMessage(<FormattedMessage id="message.save-success" defaultMessage="Saved successfully." />);
    handleClose();
  }

  function handleClose() {
    setAddWebsite(null);
    setEditWebsite(null);
    setDeleteWebsite(null);
    setShowCode(null);
    setShowUrl(null);
  }

  if (!data) {
    return null;
  }

  const empty = (
    <EmptyPlaceholder
      msg={
        <FormattedMessage
          id="message.no-websites-configured"
          defaultMessage="You don't have any websites configured."
        />
      }
    >
      <Button icon={<Plus />} size="medium" onClick={() => setAddWebsite(true)}>
        <FormattedMessage id="label.add-website" defaultMessage="Add website" />
      </Button>
    </EmptyPlaceholder>
  );

  return (
    <>
      <PageHeader>
        <div>
          <FormattedMessage id="label.websites" defaultMessage="Websites" />
        </div>
        <Button icon={<Plus />} size="small" onClick={() => setAddWebsite(true)}>
          <FormattedMessage id="label.add-website" defaultMessage="Add website" />
        </Button>
      </PageHeader>
      <Table columns={columns} rows={data} empty={empty} />
      {editWebsite && (
        <Modal title={<FormattedMessage id="label.edit-website" defaultMessage="Edit website" />}>
          <WebsiteEditForm values={editWebsite} onSave={handleSave} onClose={handleClose} />
        </Modal>
      )}
      {addWebsite && (
        <Modal title={<FormattedMessage id="label.add-website" defaultMessage="Add website" />}>
          <WebsiteEditForm onSave={handleSave} onClose={handleClose} />
        </Modal>
      )}
      {deleteWebsite && (
        <Modal
          title={<FormattedMessage id="label.delete-website" defaultMessage="Delete website" />}
        >
          <DeleteForm
            values={{ type: 'website', id: deleteWebsite.website_id, name: deleteWebsite.name }}
            onSave={handleSave}
            onClose={handleClose}
          />
        </Modal>
      )}
      {showCode && (
        <Modal title={<FormattedMessage id="label.tracking-code" defaultMessage="Tracking code" />}>
          <TrackingCodeForm values={showCode} onClose={handleClose} />
        </Modal>
      )}
      {showUrl && (
        <Modal title={<FormattedMessage id="label.share-url" defaultMessage="Share URL" />}>
          <ShareUrlForm values={showUrl} onClose={handleClose} />
        </Modal>
      )}
      {message && <Toast message={message} onClose={() => setMessage(null)} />}
    </>
  );
}
