import Link from 'next/link';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumn,
  Button,
  Icon,
  Icons,
  Flexbox,
} from 'react-basics';
import { defineMessages, useIntl } from 'react-intl';

const { ArrowRight, External } = Icons;

const messages = defineMessages({
  name: { id: 'label.name', defaultMessage: 'Name' },
  domain: { id: 'label.domain', defaultMessage: 'Domain' },
});

export default function WebsitesTable({ data = [] }) {
  const { formatMessage } = useIntl();

  const columns = [
    { name: 'name', label: formatMessage(messages.name), style: { flex: 2 } },
    { name: 'domain', label: formatMessage(messages.domain) },
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
          const { id } = row;

          row.action = (
            <Flexbox flex={1} justifyContent="end" gap={10}>
              <Link href={`/settings/websites/${id}`}>
                <a>
                  <Button>
                    <Icon>
                      <ArrowRight />
                    </Icon>
                    Settings
                  </Button>
                </a>
              </Link>
              <Link href={`/websites/${id}`}>
                <a>
                  <Button>
                    <Icon>
                      <External />
                    </Icon>
                    View
                  </Button>
                </a>
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
