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
  useBreakpoint,
} from 'react-basics';
import useMessages from 'hooks/useMessages';
import useConfig from 'hooks/useConfig';

export default function WebsitesTable({ data = [] }) {
  const { formatMessage, labels } = useMessages();
  const { openExternal } = useConfig();
  const breakPoint = useBreakpoint();

  const columns = [
    { name: 'name', label: formatMessage(labels.name), style: { flex: 2 } },
    { name: 'domain', label: formatMessage(labels.domain) },
    { name: 'action', label: ' ', style: { flexBasis: '100%' } },
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
          const { id } = row;

          row.action = (
            <Flexbox flex={1} justifyContent="end" gap={10}>
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
