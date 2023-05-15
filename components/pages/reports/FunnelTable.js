import DataTable from 'components/metrics/DataTable';
import useMessages from 'hooks/useMessages';
import { useState } from 'react';

export function DevicesTable({ ...props }) {
  const { formatMessage, labels } = useMessages();
  const { data } = props;

  const tableData =
    data?.map(a => ({ x: a.url, y: a.count, z: (a.count / data[0].count) * 100 })) || [];

  console.log(tableData);

  return <DataTable data={tableData} title="Url" type="device" />;
}

export default DevicesTable;
