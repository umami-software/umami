import {
  AlertDialog,
  Button,
  Icon,
  Menu,
  MenuItem,
  MenuTrigger,
  Modal,
  Popover,
  Row,
  Text,
} from '@umami/react-zen';
import { type ReactNode, useState } from 'react';
import { useMessages } from '@/components/hooks';
import { useDeleteQuery } from '@/components/hooks/queries/useDeleteQuery';
import { Edit, MoreHorizontal, Trash } from '@/components/icons';
import { DialogButton } from './DialogButton';

export function ReportEditButton({
  id,
  name,
  type,
  title,
  width,
  height,
  minWidth,
  minHeight,
  children,
  onDelete,
}: {
  id: string;
  name: string;
  type: string;
  title?: ReactNode;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  onDelete?: () => void;
  children: ({ close }: { close: () => void }) => ReactNode;
}) {
  const { t, labels, messages } = useMessages();
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
              <Text>{t(labels.edit)}</Text>
            </MenuItem>
            <MenuItem id="delete">
              <Icon>
                <Trash />
              </Icon>
              <Text>{t(labels.delete)}</Text>
            </MenuItem>
          </Menu>
        </Popover>
      </MenuTrigger>
      <DialogButton
        isOpen={showEdit}
        onOpenChange={open => !open && handleClose()}
        title={title}
        width={width}
        height={height}
        minWidth={minWidth}
        minHeight={minHeight}
      >
        {children}
      </DialogButton>
      <Modal isOpen={showDelete} isDismissable={true} onOpenChange={open => !open && handleClose()}>
        <AlertDialog
          title={t(labels.delete)}
          onConfirm={handleDelete}
          onCancel={handleClose}
          isDanger
        >
          <Row gap="1">{t(messages.confirmDelete, { target: name })}</Row>
        </AlertDialog>
      </Modal>
    </>
  );
}
