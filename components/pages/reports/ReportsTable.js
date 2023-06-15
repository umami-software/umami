import Link from 'next/link';
import { Button, Text, Icon, Icons } from 'react-basics';
import SettingsTable from 'components/common/SettingsTable';
import useMessages from 'hooks/useMessages';
import useConfig from 'hooks/useConfig';

export function ReportsTable({ data = [] }) {
  const { formatMessage, labels } = useMessages();
  const { openExternal } = useConfig();

  const columns = [
    { name: 'name', label: formatMessage(labels.name) },
    { name: 'description', label: formatMessage(labels.description) },
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
