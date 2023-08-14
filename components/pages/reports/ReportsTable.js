import { useState } from 'react';
import { Flexbox, Icon, Icons, Text, Button, Modal } from 'react-basics';
import LinkButton from 'components/common/LinkButton';
import SettingsTable from 'components/common/SettingsTable';
import ConfirmDeleteForm from 'components/common/ConfirmDeleteForm';
import { useMessages } from 'hooks';

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

  const handleConfirm = () => {
    onDelete(report.id);
  };

  return (
    <>
      <SettingsTable
        columns={columns}
        data={data}
        showSearch={true}
        showPaging={true}
        onFilterChange={onFilterChange}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        filterValue={filterValue}
      >
        {row => {
          const { id } = row;
          if (showDomain) {
            row.domain = row.website.domain;
          }

          return (
            <Flexbox gap={10}>
              <LinkButton href={`/reports/${id}`}>{formatMessage(labels.view)}</LinkButton>
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
