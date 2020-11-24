import React from 'react';

export default function TableNew({
  getTableProps,
  getTableBodyProps,
  headerGroups,
  prepareRow,
  page,
}) {
  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr key={headerGroup} {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th key={column} {...column.getHeaderProps()}>
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {page.map(row => {
          prepareRow(row);
          return (
            <tr key={row} {...row.getRowProps()}>
              {row.cells.map(cell => {
                return (
                  <td key={cell} {...cell.getCellProps()}>
                    {cell.render('Cell', { ...row.original })}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
