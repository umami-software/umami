import { ReactNode, useState } from 'react';
import { useMessages } from '@/components/hooks';
import { useDeleteQuery } from '@/components/hooks/queries/useDeleteQuery';
import {
  AlertDialog,
  Button,
  Icon,
  Menu,
  MenuItem,
  MenuTrigger,
  Modal,
  Popover,
  Text,
  Row,
} from '@umami/react-zen';
import { Edit, MoreHorizontal, Trash } from '@/components/icons';

export function ReportEditButton({
  id,
  name,
  type,
  children,
  onDelete,
}: {
  id: string;
  name: string;
  type: string;
  onDelete?: () => void;
  children: ({ close }: { close: () => void }) => ReactNode;
}) {
  const { formatMessage, labels, messages } = useMessages();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const { mutateAsync, touch } = useDeleteQuery(`/reports/${id}`);

  const handleAction = (id: any) => {
    if (id === 'edit') {
      setShowEdit(true);
    } else if (id === 'delete') {
      setShowDelete(true);
    }
  };

  const handleClose = () => {
    setShowEdit(false);
    setShowDelete(false);
  };

  const handleDelete = async () => {
    await mutateAsync(null, {
      onSuccess: async () => {
        touch(`reports:${type}`);
        setShowDelete(false);
        onDelete?.();
      },
    });
  };

  return (
    <>
      <MenuTrigger>
        <Button variant="quiet">
          <Icon>
            <MoreHorizontal />
          </Icon>
        </Button>
        <Popover placement="bottom">
          <Menu onAction={handleAction}>
            <MenuItem id="edit">
              <Icon>
                <Edit />
              </Icon>
              <Text>{formatMessage(labels.edit)}</Text>
            </MenuItem>
            <MenuItem id="delete">
              <Icon>
                <Trash />
              </Icon>
              <Text>{formatMessage(labels.delete)}</Text>
            </MenuItem>
          </Menu>
        </Popover>
      </MenuTrigger>
      <Modal isOpen={showEdit || showDelete} isDismissable={true}>
        {showEdit && children({ close: handleClose })}
        {showDelete && (
          <AlertDialog
            title={formatMessage(labels.delete)}
            onConfirm={handleDelete}
            onCancel={handleClose}
            isDanger
          >
            <Row gap="1">{formatMessage(messages.confirmDelete, { target: name })}</Row>
          </AlertDialog>
        )}
      </Modal>
    </>
  );
}
