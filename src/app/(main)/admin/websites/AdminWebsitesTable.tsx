import { DataColumn, DataTable, Dialog, Icon, MenuItem, Modal, Row, Text } from '@umami/react-zen';
import Link from 'next/link';
import { useState } from 'react';
import { WebsiteDeleteForm } from '@/app/(main)/websites/[websiteId]/settings/WebsiteDeleteForm';
import { DateDistance } from '@/components/common/DateDistance';
import { useMessages } from '@/components/hooks';
import { Edit, Trash, Users } from '@/components/icons';
import { MenuButton } from '@/components/input/MenuButton';

export function AdminWebsitesTable({ data = [], ...props }: { data: any[] }) {
  const { t, labels } = useMessages();
  const [deleteWebsite, setDeleteWebsite] = useState(null);

  return (
    <>
      <DataTable data={data} {...props}>
        <DataColumn id="name" label={t(labels.name)}>
          {(row: any) => (
            <Text truncate>
              <Link href={`/admin/websites/${row.id}`}>{row.name}</Link>
            </Text>
          )}
        </DataColumn>
        <DataColumn id="domain" label={t(labels.domain)}>
          {(row: any) => <Text truncate>{row.domain}</Text>}
        </DataColumn>
        <DataColumn id="owner" label={t(labels.owner)}>
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
        <DataColumn id="created" label={t(labels.created)} width="180px">
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
                    <Text>{t(labels.edit)}</Text>
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
                    <Text>{t(labels.delete)}</Text>
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
