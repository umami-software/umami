import React, { useLayoutEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Link from 'components/common/Link';
import DateFilter from 'components/common/DateFilter';
import Page from 'components/layout/Page';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import useFetch from 'hooks/useFetch';
import useDateRange from 'hooks/useDateRange';
import useShareToken from 'hooks/useShareToken';
import Arrow from 'assets/arrow-right.svg';
import { get } from 'lib/web';
import { TOKEN_HEADER } from 'lib/constants';
import { useRouter } from 'next/router';
import { useTable, usePagination } from 'react-table';
import find from 'lodash.find';

export default function WebsiteList({ userId }) {
  const [stats, setStats] = useState([]);
  const fetchedData = useFetch('/api/websites', { params: { user_id: userId } });
  const { basePath } = useRouter();
  const shareToken = useShareToken();
  const [dateRange, setDateRange] = useDateRange();
  const { startDate, endDate, value } = dateRange;

  const websitesIds = useMemo(() => {
    if (!fetchedData.data) return [];
    return fetchedData.data.map(site => site.website_id);
  }, [fetchedData.data]);

  const tableData = useMemo(() => {
    if (!fetchedData.data || !stats.length) return [];

    const _data = [];
    fetchedData.data.forEach(i => {
      const stat = find(stats, { id: i.website_id }) || {};
      _data.push({ ...i, ...stat.data });
    });
    return _data;
  }, [fetchedData.data, stats.length]);

  const getStats = async () => {
    const websitesData = [];
    for (let id of websitesIds) {
      const url = `/api/website/${id}/stats`;
      const _data = await get(
        `${basePath}${url}`,
        {
          start_at: +startDate,
          end_at: +endDate,
          url,
        },
        {
          [TOKEN_HEADER]: shareToken?.token,
        },
      );
      websitesData.push({ data: _data.data, id });
    }
    return Promise.all(websitesData).then(res => {
      setStats(res);
    });
  };

  useLayoutEffect(() => {
    getStats();
  }, [fetchedData.data, stats.length]);

  const tableColumns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Domain',
        accessor: 'domain',
      },
      {
        Header: 'Views',
        accessor: 'pageviews',
      },
      {
        Header: 'Visitors',
        accessor: 'uniques',
      },
      {
        Header: 'Bounce rate',
        accessor: 'bounces',
      },
      {
        Header: 'Details',
        accessor: 'details',
        Cell: ({ website_id }) => (
          <Link
            href="/website/[...id]"
            as={`/website/${website_id}/${name}`}
            icon={<Arrow />}
            size="small"
            iconRight
          >
            Details
          </Link>
        ),
      },
    ],
    [],
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns: tableColumns,
      data: tableData,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    usePagination,
  );

  return (
    <Page>
      <DateFilter value={value} startDate={startDate} endDate={endDate} onChange={setDateRange} />
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
      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {'<<'}
        </button>{' '}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'<'}
        </button>{' '}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {'>'}
        </button>{' '}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {'>>'}
        </button>{' '}
        <span>
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
        </span>
        <span>
          | Go to page:{' '}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            style={{ width: '100px' }}
          />
        </span>{' '}
        <select
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      {/* <Table columns={columns} rows={data} empty={empty} /> */}
      {/* {data.map(({ website_id, name, domain }) => (
        <div key={website_id} className={styles.website}>
          <WebsiteChart websiteId={website_id} title={name} domain={domain} showLink />
        </div>
      ))} */}
      {fetchedData.data?.length === 0 && (
        <EmptyPlaceholder
          msg={
            <FormattedMessage
              id="message.no-websites-configured"
              defaultMessage="You don't have any websites configured."
            />
          }
        >
          <Link href="/settings" icon={<Arrow />} iconRight>
            <FormattedMessage id="message.go-to-settings" defaultMessage="Go to settings" />
          </Link>
        </EmptyPlaceholder>
      )}
    </Page>
  );
}
