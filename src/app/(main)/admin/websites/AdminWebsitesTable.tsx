import { useState } from 'react';
import Link from 'next/link';
import { Row, Text, Icon, DataTable, DataColumn, MenuItem, Modal, Dialog } from '@umami/react-zen';
import { Trash, Users } from '@/components/icons';
import { useMessages } from '@/components/hooks';
import { Edit } from '@/components/icons';
import { MenuButton } from '@/components/input/MenuButton';
import { DateDistance } from '@/components/common/DateDistance';
import { WebsiteDeleteForm } from '@/app/(main)/websites/[websiteId]/settings/WebsiteDeleteForm';

export function AdminWebsitesTable({ data = [] }: { data: any[] }) {
  const { formatMessage, labels } = useMessages();
  const [deleteWebsite, setDeleteWebsite] = useState(null);

  return (
    <>
      <DataTable data={data}>
        <DataColumn id="name" label={formatMessage(labels.name)}>
          {(row: any) => (
            <Text truncate>
              <Link href={`/admin/websites/${row.id}`}>{row.name}</Link>
            </Text>
          )}
        </DataColumn>
        <DataColumn id="domain" label={formatMessage(labels.domain)}>
          {(row: any) => <Text truncate>{row.domain}</Text>}
        </DataColumn>
        <DataColumn id="owner" label={formatMessage(labels.owner)}>
          {(row: any) => {
            if (row?.team) {
              return (
                <Row alignItems="center" gap>
                  <Icon>
                    <Users />
                  </Icon>
                  <Text truncate>
                    <Link href={`/admin/teams/${row?.team?.id}`}>{row?.team?.name}</Link>
                  </Text>
                </Row>
              );
            }
            return (
              <Text truncate>
                <Link href={`/admin/users/${row?.user?.id}`}>{row?.user?.username}</Link>
              </Text>
            );
          }}
        </DataColumn>
        <DataColumn id="created" label={formatMessage(labels.created)} width="180px">
          {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
        </DataColumn>
        <DataColumn id="action" align="end" width="50px">
          {(row: any) => {
            const { id } = row;

            return (
              <MenuButton>
                <MenuItem href={`/admin/websites/${id}`} data-test="link-button-edit">
                  <Row alignItems="center" gap>
                    <Icon>
                      <Edit />
                    </Icon>
                    <Text>{formatMessage(labels.edit)}</Text>
                  </Row>
                </MenuItem>
                <MenuItem
                  id="delete"
                  onAction={() => setDeleteWebsite(id)}
                  data-test="link-button-delete"
                >
                  <Row alignItems="center" gap>
                    <Icon>
                      <Trash />
                    </Icon>
                    <Text>{formatMessage(labels.delete)}</Text>
                  </Row>
                </MenuItem>
              </MenuButton>
            );
          }}
        </DataColumn>
      </DataTable>
      <Modal isOpen={!!deleteWebsite}>
        <Dialog style={{ width: 400 }}>
          <WebsiteDeleteForm websiteId={deleteWebsite} onClose={() => setDeleteWebsite(null)} />
        </Dialog>
      </Modal>
    </>
  );
}
