import DataTable from 'components/metrics/DataTable';

export function FunnelTable({ ...props }) {
  const { data } = props;

  const tableData =
    data?.map(a => ({ x: a.x, y: a.y, z: Math.floor(a.y / data[0].y) * 100 })) || [];

  return <DataTable data={tableData} title="Url" type="device" />;
}

export default FunnelTable;
