import ConfirmDeleteForm from 'components/common/ConfirmDeleteForm';
import LinkButton from 'components/common/LinkButton';
import SettingsTable from 'components/common/SettingsTable';
import { useMessages } from 'components/hooks';
import useUser from 'components/hooks/useUser';
import { useState } from 'react';
import { Button, Flexbox, Icon, Icons, Modal, Text } from 'react-basics';
import { REPORT_TYPES } from 'lib/constants';

export function ReportsTable({
  data = [],
  onDelete = () => {},
  filterValue,
  onFilterChange,
  onPageChange,
  onPageSizeChange,
  showDomain,
}) {
  const [report, setReport] = useState(null);
  const { formatMessage, labels } = useMessages();
  const { user } = useUser();

  const domainColumn = [
    {
      name: 'domain',
      label: formatMessage(labels.domain),
    },
  ];

  const columns = [
    { name: 'name', label: formatMessage(labels.name) },
    { name: 'description', label: formatMessage(labels.description) },
    { name: 'type', label: formatMessage(labels.type) },
    ...(showDomain ? domainColumn : []),
    { name: 'action', label: ' ' },
  ];

  const cellRender = (row, data, key) => {
    if (key === 'type') {
      return formatMessage(
        labels[Object.keys(REPORT_TYPES).find(key => REPORT_TYPES[key] === row.type)],
      );
    }
    return data[key];
  };

  const handleConfirm = () => {
    onDelete(report.id);
  };

  return (
    <>
      <SettingsTable
        columns={columns}
        cellRender={cellRender}
        data={data}
        showSearch={true}
        showPaging={true}
        onFilterChange={onFilterChange}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        filterValue={filterValue}
      >
        {row => {
          const { id, userId: reportOwnerId, website } = row;
          if (showDomain) {
            row.domain = website.domain;
          }

          return (
            <Flexbox gap={10}>
              <LinkButton href={`/reports/${id}`}>{formatMessage(labels.view)}</LinkButton>
              {!showDomain || user.id === reportOwnerId || user.id === website?.userId}
              <Button onClick={() => setReport(row)}>
                <Icon>
                  <Icons.Trash />
                </Icon>
                <Text>{formatMessage(labels.delete)}</Text>
              </Button>
            </Flexbox>
          );
        }}
      </SettingsTable>
      {report && (
        <Modal>
          <ConfirmDeleteForm
            name={report.name}
            onConfirm={handleConfirm}
            onClose={() => setReport(null)}
          />
        </Modal>
      )}
    </>
  );
}

export default ReportsTable;
