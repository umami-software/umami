import ConfirmDeleteForm from 'components/common/ConfirmDeleteForm';
import LinkButton from 'components/common/LinkButton';
import { useMessages } from 'components/hooks';
import useUser from 'components/hooks/useUser';
import {
  Button,
  GridColumn,
  GridTable,
  Icon,
  Icons,
  Modal,
  ModalTrigger,
  Text,
} from 'react-basics';
import { REPORT_TYPES } from 'lib/constants';

export function ReportsTable({ data = [], onDelete, showDomain }) {
  const { formatMessage, labels } = useMessages();
  const { user } = useUser();

  const handleConfirm = (id, callback) => {
    onDelete?.(id, callback);
  };

  return (
    <GridTable data={data}>
      <GridColumn name="name" label={formatMessage(labels.name)} />
      <GridColumn name="description" label={formatMessage(labels.description)} />
      <GridColumn name="type" label={formatMessage(labels.type)}>
        {row => {
          return formatMessage(
            labels[Object.keys(REPORT_TYPES).find(key => REPORT_TYPES[key] === row.type)],
          );
        }}
      </GridColumn>
      {showDomain && (
        <GridColumn name="domain" label={formatMessage(labels.domain)}>
          {row => row.website.domain}
        </GridColumn>
      )}
      <GridColumn name="action" label="" alignment="end">
        {row => {
          const { id, name, userId, website } = row;
          return (
            <>
              <LinkButton href={`/reports/${id}`}>{formatMessage(labels.view)}</LinkButton>
              {(user.id === userId || user.id === website?.userId) && (
                <ModalTrigger>
                  <Button>
                    <Icon>
                      <Icons.Trash />
                    </Icon>
                    <Text>{formatMessage(labels.delete)}</Text>
                  </Button>
                  <Modal>
                    {close => (
                      <ConfirmDeleteForm
                        name={name}
                        onConfirm={handleConfirm.bind(null, id, close)}
                        onClose={close}
                      />
                    )}
                  </Modal>
                </ModalTrigger>
              )}
            </>
          );
        }}
      </GridColumn>
    </GridTable>
  );
}

export default ReportsTable;
