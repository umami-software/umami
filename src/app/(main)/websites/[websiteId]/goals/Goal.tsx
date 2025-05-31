import { useState } from 'react';
import {
  Grid,
  Row,
  Column,
  Text,
  Icon,
  Button,
  MenuTrigger,
  Menu,
  MenuItem,
  Popover,
  ProgressBar,
  Dialog,
  Modal,
  AlertDialog,
} from '@umami/react-zen';
import { useMessages, useResultQuery } from '@/components/hooks';
import { Edit, More, Trash, File, Lightning, User, Eye } from '@/components/icons';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { formatLongNumber } from '@/lib/format';
import { GoalAddForm } from '@/app/(main)/websites/[websiteId]/goals/GoalAddForm';
import { useDeleteQuery } from '@/components/hooks/queries/useDeleteQuery';

export interface GoalProps {
  id: string;
  name: string;
  type: string;
  parameters: {
    name: string;
    type: string;
    value: string;
  };
  websiteId: string;
  startDate: Date;
  endDate: Date;
}

export type GoalData = { num: number; total: number };

export function Goal({ id, name, type, parameters, websiteId, startDate, endDate }: GoalProps) {
  const { formatMessage, labels } = useMessages();
  const { data, error, isLoading } = useResultQuery<GoalData>(type, {
    ...parameters,
    websiteId,
    dateRange: {
      startDate,
      endDate,
    },
  });
  const isPage = parameters?.type === 'page';

  return (
    <LoadingPanel isEmpty={!data} isLoading={isLoading} error={error}>
      <Grid gap>
        <Grid columns="1fr auto" gap>
          <Column gap>
            <Row>
              <Text size="4" weight="bold">
                {name}
              </Text>
            </Row>
          </Column>
          <Column>
            <ActionsButton id={id} websiteId={websiteId} />
          </Column>
        </Grid>
        <Row alignItems="center" justifyContent="space-between" gap>
          <Text color="muted">
            {formatMessage(isPage ? labels.viewedPage : labels.triggeredEvent)}
          </Text>
          <Text color="muted">{formatMessage(labels.conversionRate)}</Text>
        </Row>
        <Row alignItems="center" justifyContent="space-between" gap>
          <Row alignItems="center" gap>
            <Icon>{parameters.type === 'page' ? <File /> : <Lightning />}</Icon>
            <Text>{parameters.value}</Text>
          </Row>
          <Row alignItems="center" gap>
            <Icon>{isPage ? <Eye /> : <User />}</Icon>
            <Text title={`${data?.num} / ${data?.total}`}>{`${formatLongNumber(
              data?.num,
            )} / ${formatLongNumber(data?.total)}`}</Text>
          </Row>
        </Row>
        <Row alignItems="center" gap>
          <ProgressBar
            value={data?.num || 0}
            minValue={0}
            maxValue={data?.total || 1}
            style={{ width: '100%' }}
          />
          <Text weight="bold" size="7">
            {data?.total ? Math.round((+data?.num / +data?.total) * 100) : '0'}%
          </Text>
        </Row>
      </Grid>
    </LoadingPanel>
  );
}

const ActionsButton = ({ id, websiteId }: { id: string; websiteId: string }) => {
  const { formatMessage, labels } = useMessages();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const { mutate, touch } = useDeleteQuery(`/reports/${id}`);

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
    mutate(null, {
      onSuccess: async () => {
        touch(`goals`);
        setShowDelete(false);
      },
    });
  };

  return (
    <>
      <MenuTrigger>
        <Button variant="quiet">
          <Icon>
            <More />
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
        {showEdit && (
          <Dialog variant="modal" style={{ minHeight: 375, minWidth: 300 }}>
            <GoalAddForm id={id} websiteId={websiteId} onClose={handleClose} />
          </Dialog>
        )}
        {showDelete && (
          <AlertDialog
            title={formatMessage(labels.delete)}
            onConfirm={handleDelete}
            onCancel={handleClose}
          />
        )}
      </Modal>
    </>
  );
};
