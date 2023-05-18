import DataTable from 'components/metrics/DataTable';
import useMessages from 'hooks/useMessages';

export function DevicesTable({ ...props }) {
  const { formatMessage, labels } = useMessages();
  const { data } = props;

  const tableData =
    data?.map(a => ({ x: a.x, y: a.y, z: Math.floor(a.y / data[0].y) * 100 })) || [];

  return <DataTable data={tableData} title="Url" type="device" />;
}

export default DevicesTable;
