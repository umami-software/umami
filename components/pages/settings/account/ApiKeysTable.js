import { formatDistance } from 'date-fns';
import { useState } from 'react';
import {
  Button,
  Icon,
  Modal,
  PasswordField,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Text,
} from 'react-basics';
import ApiKeyDeleteForm from 'components/pages/settings/account/ApiKeyDeleteForm';
import Trash from 'assets/trash.svg';
import styles from './ApiKeysTable.module.css';

const columns = [
  { name: 'apiKey', label: 'Key', style: { flex: 3 } },
  { name: 'created', label: 'Created', style: { flex: 1 } },
  { name: 'action', label: ' ', style: { flex: 1 } },
];

export default function ApiKeysTable({ data = [], onSave }) {
  const [apiKeyId, setApiKeyId] = useState(null);

  const handleSave = () => {
    setApiKeyId(null);
    onSave();
  };

  const handleClose = () => {
    setApiKeyId(null);
  };

  const handleDelete = id => {
    setApiKeyId(id);
  };

  return (
    <>
      <Table className={styles.table} columns={columns} rows={data}>
        <TableHeader>
          {(column, index) => {
            return (
              <TableColumn key={index} className={styles.header} style={{ ...column.style }}>
                {column.label}
              </TableColumn>
            );
          }}
        </TableHeader>
        <TableBody>
          {(row, keys, rowIndex) => {
            row.apiKey = <PasswordField className={styles.input} value={row.key} readOnly={true} />;

            row.created = formatDistance(new Date(row.createdAt), new Date(), {
              addSuffix: true,
            });

            row.action = (
              <div className={styles.actions}>
                <a target="_blank">
                  <Button onClick={() => handleDelete(row.id)}>
                    <Icon>
                      <Trash />
                    </Icon>
                    <Text>Delete</Text>
                  </Button>
                </a>
              </div>
            );

            return (
              <TableRow key={rowIndex} data={row} keys={keys}>
                {(data, key, colIndex) => {
                  return (
                    <TableCell
                      key={colIndex}
                      className={styles.cell}
                      style={{ ...columns[colIndex]?.style }}
                    >
                      {data[key]}
                    </TableCell>
                  );
                }}
              </TableRow>
            );
          }}
        </TableBody>
      </Table>
      {apiKeyId && (
        <Modal title="Delete API key" onClose={handleClose}>
          {close => <ApiKeyDeleteForm apiKeyId={apiKeyId} onSave={handleSave} onClose={close} />}
        </Modal>
      )}
    </>
  );
}
