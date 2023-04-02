import useMessages from 'hooks/useMessages';
import useUser from 'hooks/useUser';
import Link from 'next/link';
import {
  Button,
  Flexbox,
  Icon,
  Icons,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Text,
} from 'react-basics';
import TeamWebsiteRemoveButton from './TeamWebsiteRemoveButton';

export default function TeamWebsitesTable({ data = [], onSave }) {
  const { formatMessage, labels } = useMessages();
  const { user } = useUser();
  const columns = [
    { name: 'name', label: formatMessage(labels.name) },
    { name: 'domain', label: formatMessage(labels.domain) },
    { name: 'action', label: ' ' },
  ];

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
                <TeamWebsiteRemoveButton
                  teamWebsiteId={teamWebsiteId}
                  onSave={onSave}
                ></TeamWebsiteRemoveButton>
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
