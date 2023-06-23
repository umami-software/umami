import Link from 'next/link';
import { Button, Text, Icon, Icons } from 'react-basics';
import SettingsTable from 'components/common/SettingsTable';
import useMessages from 'hooks/useMessages';

export function ReportsTable({ data = [] }) {
  const { formatMessage, labels } = useMessages();

  const columns = [
    { name: 'name', label: formatMessage(labels.name) },
    { name: 'description', label: formatMessage(labels.description) },
    { name: 'type', label: formatMessage(labels.type) },
    { name: 'action', label: ' ' },
  ];

  return (
    <SettingsTable columns={columns} data={data}>
      {row => {
        const { id } = row;

        return (
          <Link href={`/reports/${id}`}>
            <Button>
              <Icon>
                <Icons.ArrowRight />
              </Icon>
              <Text>{formatMessage(labels.view)}</Text>
            </Button>
          </Link>
        );
      }}
    </SettingsTable>
  );
}

export default ReportsTable;
