import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  Row,
  Text,
} from '@umami/react-zen';
import { type ReactNode, useState } from 'react';
import { useMessages } from '@/components/hooks';
import { useDeleteQuery } from '@/components/hooks/queries/useDeleteQuery';
import { Edit, MoreHorizontal, Trash } from '@/components/icons';
import { DialogButton } from './DialogButton';

export function SavedDefinitionEditButton({
  id,
  websiteId,
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
  websiteId: string;
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
  const { mutateAsync, isPending, touch } = useDeleteQuery(`/websites/${websiteId}/${type}s/${id}`);

  const handleClose = () => {
    setShowEdit(false);
    setShowDelete(false);
  };

  const handleDelete = async () => {
    await mutateAsync(null, {
      onSuccess: async () => {
        touch(`websites:${type}s`);
        setShowDelete(false);
        onDelete?.();
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="icon" variant="ghost" />}>
          <Icon>
            <MoreHorizontal />
          </Icon>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" className="w-auto">
          <DropdownMenuItem onClick={() => setShowEdit(true)}>
            <Icon>
              <Edit />
            </Icon>
            <Text>{t(labels.edit)}</Text>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowDelete(true)}>
            <Icon>
              <Trash />
            </Icon>
            <Text>{t(labels.delete)}</Text>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogButton
        open={showEdit}
        onOpenChange={open => !open && handleClose()}
        title={title}
        width={width}
        height={height}
        minWidth={minWidth}
        minHeight={minHeight}
      >
        {children}
      </DialogButton>
      <AlertDialog open={showDelete} onOpenChange={open => !open && handleClose()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t(labels.delete)}</AlertDialogTitle>
          </AlertDialogHeader>
          <Row gap="1">{t(messages.confirmDelete, { target: name })}</Row>
          <AlertDialogFooter>
            <AlertDialogCancel>{t(labels.cancel)}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={() => handleDelete().catch(() => {})}
            >
              {t(labels.confirm)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
