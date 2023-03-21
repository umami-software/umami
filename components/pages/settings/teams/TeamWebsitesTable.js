import Link from 'next/link';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumn,
  Button,
  Text,
  Icon,
  Icons,
  Flexbox,
} from 'react-basics';
import { useIntl } from 'react-intl';
import { labels } from 'components/messages';
import useUser from 'hooks/useUser';
import useApi from 'hooks/useApi';

export default function TeamWebsitesTable({ data = [], onSave }) {
  const { formatMessage } = useIntl();
  const { user } = useUser();
  const { del, useMutation } = useApi();
  const { mutate } = useMutation(({ teamWebsiteId }) => del(`/teamWebsites/${teamWebsiteId}`));

  const columns = [
    { name: 'name', label: formatMessage(labels.name) },
    { name: 'domain', label: formatMessage(labels.domain) },
    { name: 'action', label: ' ' },
  ];

  const handleRemoveWebsite = teamWebsiteId => {
    mutate(
      { teamWebsiteId },
      {
        onSuccess: async () => {
          onSave();
        },
      },
    );
  };

  return (
    <Table columns={columns} rows={data}>
      <TableHeader>
        {(column, index) => {
          return (
            <TableColumn key={index} style={{ ...column.style }}>
              {column.label}
            </TableColumn>
          );
        }}
      </TableHeader>
      <TableBody>
        {(row, keys, rowIndex) => {
          const { id: teamWebsiteId } = row;
          const { id: websiteId, name, domain, userId } = row.website;
          const { teamUser } = row.team;
          const owner = teamUser[0];
          const canRemove = user.id === userId || user.id === owner.userId;

          row.name = name;
          row.domain = domain;

          row.action = (
            <Flexbox flex={1} justifyContent="end" gap={10}>
              <Link href={`/websites/${websiteId}`} target="_blank">
                <Button>
                  <Icon>
                    <Icons.External />
                  </Icon>
                  <Text>{formatMessage(labels.view)}</Text>
                </Button>
              </Link>
              {canRemove && (
                <Button onClick={() => handleRemoveWebsite(teamWebsiteId)}>
                  <Icon>
                    <Icons.Trash />
                  </Icon>
                  <Text>{formatMessage(labels.remove)}</Text>
                </Button>
              )}
            </Flexbox>
          );

          return (
            <TableRow key={rowIndex} data={row} keys={keys}>
              {(data, key, colIndex) => {
                return (
                  <TableCell key={colIndex} style={{ ...columns[colIndex]?.style }}>
                    <Flexbox flex={1} alignItems="center">
                      {data[key]}
                    </Flexbox>
                  </TableCell>
                );
              }}
            </TableRow>
          );
        }}
      </TableBody>
    </Table>
  );
}
