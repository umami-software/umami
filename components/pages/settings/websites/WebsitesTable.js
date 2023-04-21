import Link from 'next/link';
import { Button, Text, Icon, Icons } from 'react-basics';
import SettingsTable from 'components/common/SettingsTable';
import useMessages from 'hooks/useMessages';
import useConfig from 'hooks/useConfig';

export function WebsitesTable({ data = [] }) {
  const { formatMessage, labels } = useMessages();
  const { openExternal } = useConfig();

  const columns = [
    { name: 'name', label: formatMessage(labels.name) },
    { name: 'domain', label: formatMessage(labels.domain) },
    { name: 'action', label: ' ' },
  ];

  return (
    <SettingsTable columns={columns} data={data}>
      {row => {
        const { id } = row;

        return (
          <>
            <Link href={`/settings/websites/${id}`}>
              <Button>
                <Icon>
                  <Icons.Edit />
                </Icon>
                <Text>{formatMessage(labels.edit)}</Text>
              </Button>
            </Link>
            <Link href={`/websites/${id}`} target={openExternal ? '_blank' : null}>
              <Button>
                <Icon>
                  <Icons.External />
                </Icon>
                <Text>{formatMessage(labels.view)}</Text>
              </Button>
            </Link>
          </>
        );
      }}
    </SettingsTable>
  );
}

export default WebsitesTable;
